# hexo-image-cloudflare

A hexo plugin to use Cloudflare to cache images, powered by [images.weserv.nl](https://images.weserv.nl/).

## Installation

```
npm i hexo-image-cloudflare
```

## Usage

After installing the plugin, all image links will be converted to CDN links automatically. For example, the origin markdown file is

```md
![Work/Life Balance](https://drive.google.com/uc?id=1PElTKhhNIPYSuoXIQtwTyq-RcWKA5MYd&export=download)
```

Then it will be converted to

```md
![Work/Life Balance](https://images.weserv.nl/?url=https://drive.google.com/uc?id=1PElTKhhNIPYSuoXIQtwTyq-RcWKA5MYd&export=download)
```

You can custom the [CDN server](https://github.com/weserv/images) in `_config.yml`, and the default value is `https://images.weserv.nl/`:

```
cdn_server: https://images.weserv.nl/
```

