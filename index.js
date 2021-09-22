/**
 * * Reference:
 * * https://github.com/lzuliuyun/hexo-image-cdn/blob/ab6ed9f0b8108dd7ed8d6bcd387824c5df1fcc50/index.js#L5-L16
 * */

const full_url_for = require('hexo-util').full_url_for.bind(hexo);
const util = require('util');
const url = require("url");
const querystring = require('querystring');
const tag = require('html-tag');
const cdn_server = hexo.config.cdn_server || (hexo.config.cdn && hexo.config.cdn.server) || "https://images.weserv.nl";
const native_resize = hexo.config.cdn && hexo.config.cdn.native || false;
const cdn_prefix = native_resize ? "/cdn-cgi/image/" : (cdn_server + "/?");
const use_webp = !native_resize && hexo.config.cdn_use_webp || (hexo.config.cdn && hexo.config.cdn.use_webp) || false;
const max_width = hexo.config.cdn && hexo.config.cdn.max_width;
const exclude_domains = hexo.config.cdn && hexo.config.cdn.exclude_domains;
const { unescapeHTML } = require('hexo-util');

var max_widths;
// convert number to list
if (typeof max_width == "number") {
  max_widths = [max_width];
} else if (max_width) {
  max_widths = max_width;
  max_widths.sort(function (a, b) { return b - a });
} else {
  max_widths = [];
}
max_widths.push(null);

function cdn_link(link, output = null, width = null) {
  link = unescapeHTML(link);
  if (exclude_domains && exclude_domains.some((domain) => link.startsWith(domain))) {
    // skip using cdns
    return link;
  }
  if (!native_resize) {
    const obj = {
      url: full_url_for(link),
      default: full_url_for(link)
    }
    if (output) {
      obj.output = output;
    }
    if (width) {
      obj.w = width;
      obj.we = '';
    }
    return cdn_prefix + querystring.stringify(obj);
  } else {
    // native resize
    var options = "";
    if (width) {
      options += `,fit=scale-down,w=${width}`;
    }
    return `/cdn-cgi/image/onerror=redirect,f=auto${options}/${link}`;
  }
}

function parse_url(link) {
  if (!native_resize) {
    return url.parse(link, true).query.url;
  } else {
    return link.replace('/cdn-cgi/image/onerror=redirect,f=auto/', '');
  }
}

function source_tag(link, type = null) {
  const obj = {};
  const urlwidth = [];
  for (let ii = 0; ii < max_widths.length; ii++) {
    let new_link = cdn_link(link, output = type, width = max_widths[ii]);
    const uw = max_widths[ii] ? `${new_link} ${max_widths[ii]}w` : new_link;
    urlwidth.push(uw);
  }
  obj.srcset = urlwidth.join();
  if (type) {
    obj.type = "image/" + type;
  }
  return tag('source', obj);
}

if (!native_resize)
  hexo.extend.injector.register('head_end', `<link rel="preconnect" href="${cdn_server}">`);

hexo.extend.filter.register('before_post_render', function (data) {
  const reg = /!\[(.*?)\]\((.*?)\)/g;
  data.cover && (data.cover = cdn_link(data.cover));
  data.content = data.content.replace(reg, function (str, p1, p2) {
    return util.format('![%s](%s)', p1, cdn_link(p2));
  });
  return data;
});

hexo.extend.filter.register('after_post_render', function (data) {
  const reg = /background\-image:(\s*?)url\((.*?)\)/g;
  data.content = data.content.replace(reg, function (str, p1, p2) {
    return util.format('background-image:%surl(%s)', p1, cdn_link(p2));
  });
  return data;
});

hexo.extend.filter.register('after_post_render', function (data) {
  // replace object data
  const reg = /<object(.*?)data="(.*?)"(.*?)>/gi;
  data.content = data.content.replace(reg, function (str, p1, p2, p3) {
    return util.format('<img%ssrc="%s"%s>', p1, cdn_link(p2), p3);
  });
  return data;
}, -2);


hexo.extend.filter.register('after_render:html', function (htmlContent) {
  const reg = /<img(.*?)(data\-)?src="(.*?)"(.*?)>/gi;
  return htmlContent.replace(reg, function (str, p1, _, p2) {
    if (/webp-comp/gi.test(p1)) {
      return str;
    }
    if (!p2.startsWith(cdn_prefix)) {
      // add CDN
      const new_url = cdn_link(p2);
      if (new_url == p2) {
        // skip if excluded
        return str;
      }
      str = str.replace(p2, new_url);
      p2 = new_url;
    }
    if (use_webp || max_width) {
      var link = parse_url(p2);
      var source_str = "";
      if (use_webp) {
        source_str += source_tag(link, type = 'webp');
        source_str += source_tag(link, type = 'png');
      } else {
        source_str += source_tag(link);
      }
      return `<picture>${source_str}
				${str.replace('<img', `<img webp-comp data-zoom-src="${p2}"`)}
			</picture>`;
    } else {
      return str;
    }
  });
}, -1);


