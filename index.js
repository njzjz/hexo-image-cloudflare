/**
 * * Reference:
 * * https://github.com/lzuliuyun/hexo-image-cdn/blob/ab6ed9f0b8108dd7ed8d6bcd387824c5df1fcc50/index.js#L5-L16
 * */

const full_url_for = require('hexo-util').full_url_for.bind(hexo);
const util = require('util');
var cdn_server = hexo.config.cdn_server || "https://images.weserv.nl";
var cdn_prefix = cdn_server + "/?url=";

function cdn_link(link){
	return cdn_prefix + full_url_for(link);
}
function replacer(match, p1, p2, offset, string) {
	return util.format('[%s](%s)', p1, cdn_link(p2));
}

hexo.extend.filter.register('before_post_render', function(data){
	var reg = /!\[(.*)\]\((.*)\)/g;
	data.cover && (data.cover = cdn_link(data.cover));
	data.content = data.content.replace(reg, replacer);
	return data;
});
