
  (function() {
    var photo = localStorage.getItem('user_photo');
    if (photo) {
      document.write('<style id="anti-flicker-avatar">');
      document.write('.user-avatar { background-image: url(' + photo + '); background-size: cover; background-position: center; }');
      document.write('.user-avatar i { display: none; }');
      document.write('.pd-avatar { background-image: url(' + photo + '); background-size: cover; background-position: center; }');
      document.write('.pd-avatar i { display: none; }');
      document.write('.big-avatar { background-image: url(' + photo + ') !important; background-size: cover !important; }');
      document.write('</style>');
    }
  })();
