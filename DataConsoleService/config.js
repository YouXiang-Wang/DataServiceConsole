var path = require("path");
var pkg = require("./package.json");

var config = {
  debug: true,
  name: "",
  description: "",
  version: pkg.version,

  // site settings
  site_headers: [
    '<meta name="author" content="" />',
  ],
  host: "localhost",
  // Google tracker ID, http://www.google.com/analytics/
  google_tracker_id: 'UA-41753901-5',
  site_logo: '',
  site_icon: '',
  site_navs: [
    // [ path, title, [target=''] ]
    [ '/about', 'About' ],
  ],
  site_static_host: "", // static files
  mini_assets: false, // static files compressed
  site_enable_search_preview: false, // google search preview ON
  site_google_search_domain: 'cnodejs.org',  // google search preview  "domain name"

  upload_dir: path.join(__dirname, 'public', 'user_data', 'images'),

  db: 'mongodb://localhost/pmrdb',
  db_name: 'pmrdb',
  session_secret: 'pmrdb',
  auth_cookie_name: 'pmrdb',
  port: 3200,
  
  pmrRepository : '/Users/wangyouxiang/dev/PMRS2',
  // mail SMTP
  mail_opts: {
    host: 'smtp.126.com',
    port: 25,
    auth: {
      user: 'club@126.com',
      pass: 'club'
    }
  },

  //weibo app key
  weibo_key: 10000000,

  // admin
  admins: { admin: true },

  // [ { name: 'plugin_name', options: { ... }, ... ]
  plugins: [
    // { name: 'onehost', options: { host: 'localhost.cnodejs.org' } },
    // { name: 'wordpress_redirect', options: {} }
  ],
  GITHUB_OAUTH: {
    clientID: 'your GITHUB_CLIENT_ID',
    clientSecret: 'your GITHUB_CLIENT_SECRET',
    callbackURL: 'http://cnodejs.org/auth/github/callback',
  },
  allow_sign_up: true,
  newrelic_key: 'yourkey'
};

module.exports = config;
module.exports.config = config;
