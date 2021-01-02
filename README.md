# hexo-image-cloudflare

A hexo plugin to use Cloudflare to cache images, powered by [images.weserv.nl](https://images.weserv.nl/).

## Installation

```
npm i hexo-image-cloudflare
```

## Usage

After installing the plugin, all image urls will be converted to CDN urls automatically. For example, the origin markdown file is

```md
![Work/Life Balance](https://drive.google.com/uc?id=1PElTKhhNIPYSuoXIQtwTyq-RcWKA5MYd&export=download)
```

Then it will be converted to

```md
![Work/Life Balance](https://images.weserv.nl/?url=https://drive.google.com/uc?id=1PElTKhhNIPYSuoXIQtwTyq-RcWKA5MYd&export=download)
```

The local image urls will be also converted. For example, the original file is

```md
![Work/Life Balance](/img/anti996.png)
```

It will be rendered as

```md
![Work/Life Balance](https://images.weserv.nl/?url=https://your.blog/img/anti996.png)
```

where `https://your.blog` is the url of your blog that you set in `_config.yml`.


## Configuration

You can custom the [CDN server url](https://github.com/weserv/images) in `_config.yml`, and the default value is `https://images.weserv.nl`.
Some other configurations are avaible.

```yaml
cdn:
  server: https://images.weserv.nl
  use_webp: false
  max_width:
```

