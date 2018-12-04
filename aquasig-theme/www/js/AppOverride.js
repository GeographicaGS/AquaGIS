// Override _standardIni
App._standardIni = function(){
  $('body').attr('mode',this.mode = 'standard');
  
  this.auth = new App.Auth();
  this.router = new App.Router();

  this.header = new App.View.HeaderView({
    el: $('header')
  });

  this.footer = new App.View.FooterView({
    el: $('footer')
  }).render();

  this._navigationBarModel = new App.Model.NavigationBar();
  this._navigationBar = new App.View.NavigationBar({
    el: $('nav.navbar'),
    model: this._navigationBarModel
  }).render();

  this.auth.start(function(sessionStarted){
    if (!sessionStarted){
      
      Backbone.history.start({
        pushState: true,
        silent: true,
        root: '/' + App.lang + '/'
      });
      Backbone.history.loadUrl('login');

      window.location.search
        ? this.router.navigate('login_external' + window.location.search, { trigger: true })
        : this.router.navigate('login', {trigger: false});

    } else {
      
      this._metadata.start(function(){
        if (!this.started) {
          this.started = true;
          Backbone.history.start({
            pushState: true,
            root: '/' + App.lang + '/' 
          });
        }
      });
    }
  }.bind(this));
}