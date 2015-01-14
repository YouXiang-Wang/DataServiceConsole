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
  
  redownloadPMRHtml : true,
  
  pmrRepository : 'C:/PMRs',
  
  pmrReportResource : path.join(__dirname, 'resources'),
  
  pmrSystemCredential: {username: 'wangyoux@cn.ibm.com', password: 'Bagua1005' },
  
  pmrReportRepository: path.join(__dirname, 'report'),
  
  appResourceRepository: path.join(__dirname, 'resources'),
  
  baseUrlGroups: ['https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupBacklog.do?', 
                   'https://w3-01.sso.ibm.com/software/servdb/crm/secure/l3groupClosed.do?'
                   ],
  l3Groups:  [
                   'Data Studio Administrator',
                   'Optim Data Studio Core Development',
                   'Optim Development Studio /  Data Studio (Developer)',
                   'Data Studio Query Tuner / Common VE'
                   ],
  // mail SMTP
  mail_opts: {
    host: 'd23ml028.ibm.com',
    port: 25,
    auth: {
      user: 'wangyoux@cn.ibm.com',
      pass: ''
    }
  },

  // IBM mail SMTP
  ibm_mail_opts: {
    host: 'd23ml028.ibm.com'
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
    callbackURL: '',
  },
  allow_sign_up: true,
  newrelic_key: 'yourkey'
};

module.exports = config;
module.exports.config = config;
