App.Router.prototype.loginExternal = function() {
  var queryParams = App.Utils.queryParamsToObject();

  if(queryParams !== {}) {
    var user = queryParams.user || '';
    var pass = queryParams.pass || '';

    App.auth.login(user, md5(pass), function (err) {
      if (err) {
        App.router.navigate('login', { trigger: true });
      } else {
        App.mv().start(function () {
          App.router.navigate('', { trigger: true });
        });
      }
    });
  
  } else {
    App.router.navigate('login', { trigger: true });
  }
};

App.Router.prototype.routes = Object.assign({
  'login_external?(user=:user)(&pass=:pass)': 'loginExternal'
}, App.Router.prototype.routes);