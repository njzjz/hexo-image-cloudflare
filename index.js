/**
 * * Reference:
 * * https://github.com/lzuliuyun/hexo-image-cdn/blob/ab6ed9f0b8108dd7ed8d6bcd387824c5df1fcc50/index.js#L5-L16
 * */

const full_url_for = require('hexo-util').full_url_for.bind(hexo);
const util = require('util');
const url = require("url");
const querystring = require('querystring');
var cdn_server = hexo.config.cdn_server || (hexo.config.cdn && hexo.config.cdn.server) || "https://images.weserv.nl";
var cdn_prefix = cdn_server + "/?";
var use_webp = hexo.config.cdn_use_webp || (hexo.config.cdn && hexo.config.cdn.use_webp) || false;
var max_width = hexo.config.cdn && hexo.config.cdn.max_width;

function cdn_link(link, output=null, max_width=null){
  var obj = {
    url: full_url_for(link),
    default: full_url_for(link)
  }
  if(output){
    obj.output = output;
  }
  if(max_width){
    obj.w = max_width;
    obj.we = '';
  }
	return cdn_prefix + querystring.stringify(obj);
}

function parse_url(link){
  return url.parse(link, true).query.url;
}

function replacer(match, p1, p2, offset, string) {
	return util.format('![%s](%s)', p1, cdn_link(p2));
}

function source_tag(link, type=null){
  if(type){
    return `<source srcset="${p2}" type="${type}">`;
  }else{
    return `<source srcset="${p2}">`;
  }
}

hexo.extend.injector.register('head_begin', `<link rel="preconnect" href="${cdn_server}">`);

hexo.extend.filter.register('before_post_render', function(data){
	var reg = /!\[(.*)\]\((.*)\)/g;
	data.cover && (data.cover = cdn_link(data.cover));
	data.content = data.content.replace(reg, replacer);
	return data;
});

if (use_webp || max_width){
	hexo.extend.filter.register('after_render:html', function(htmlContent){
		var reg = /<img(.*?)src="(.*?)"(.*?)>/gi;
		return htmlContent.replace(reg, function(str, p1, p2) {
			if(/webp-comp/gi.test(p1) || !p2.startsWith(cdn_prefix)){
				return str;
			}
      var link = parse_url(p2);
      var source_str = "";
      if(use_webp){
        source_str += source_tag(cdn_link(p2, output='webp', max_width = max_width), type='image/webp');
        source_str += source_tag(cdn_link(p2, output='png', max_width = max_width), type='image/png');
      } else {
        source_str += source_tag(cdn_link(p2, max_width = max_width));
      }
			return `<picture>${source_str}
				${str.replace('<img', '<img webp-comp')}
			</picture>`;
		});
	});
}

