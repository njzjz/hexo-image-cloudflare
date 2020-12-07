/**
 * * Reference:
 * * https://github.com/lzuliuyun/hexo-image-cdn/blob/ab6ed9f0b8108dd7ed8d6bcd387824c5df1fcc50/index.js#L5-L16
 * */

const full_url_for = require('hexo-util').full_url_for.bind(hexo);
const util = require('util');
var cdn_server = hexo.config.cdn_server || (hexo.config.cdn && hexo.config.cdn.server) || "https://images.weserv.nl";
var cdn_prefix = cdn_server + "/?url=";
var use_webp = hexo.config.cdn_use_webp || (hexo.config.cdn && hexo.config.cdn.use_webp) || false;

function cdn_link(link){
	return cdn_prefix + encodeURIComponent(full_url_for(link)) + "&default=" + encodeURIComponent(full_url_for(link));
}
function replacer(match, p1, p2, offset, string) {
	return util.format('![%s](%s)', p1, cdn_link(p2));
}

hexo.extend.injector.register('head_begin', `<link rel="preconnect" href="${cdn_server}">`);

hexo.extend.filter.register('before_post_render', function(data){
	var reg = /!\[(.*)\]\((.*)\)/g;
	data.cover && (data.cover = cdn_link(data.cover));
	data.content = data.content.replace(reg, replacer);
	return data;
});

if (use_webp){
	hexo.extend.filter.register('after_render:html', function(htmlContent){
		var reg = /<img(.*?)src="(.*?)"(.*?)>/gi;
		return htmlContent.replace(reg, function(str, p1, p2) {
			if(/webp-comp/gi.test(p1) || !p2.startsWith(cdn_prefix)){
				return str;
			}
			return `<picture>
				<source srcset="${p2}&output=webp" type="image/webp">
				<source srcset="${p2}&output=png" type="image/png">
				${str.replace('<img', '<img webp-comp')}
			</picture>`;
		});
	});
}

