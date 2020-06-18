$(function () { 
  var proxyUrl = "https://jsonp.afeld.me/?url=",
    fxp_base_url = "https://www.fxp.co.il/",
    valid = true,
    errors = [],
    errMsg = $('#errMsg'),
    fxp_placeholder = $("#fxp-placeholder"),
    generated_code = $('#generated-code'),
    bars_loader = $('#bars-loader'),
    forum_name = $("#forum-name"),
    //forum_id = $("#forum-id"),
    user_name = $("#user-name"),
    mod_name = $("#mod-name"),
    thread_link = $("#thread-link"),
    days_count = $('#days-count'),
    choose_type = $('#choose-type'),
    choose_role = $('#choose-role'),
    forums = [],
    name = profile_url = challenges_thread = challenges_thread_reply_link = forum_logo = profile_url_thread = user_name_thread = thread_title = challenge_title = '';

  $.ajaxSetup({
    async: false
  });

  forum_name.autocomplete({
    source: function (request, response) {
      $.ajax({
        url: proxyUrl + encodeURIComponent("https://www.fxp.co.il/ajax.php?do=forumdisplayqserach&name_startsWith=" + getVal(forum_name)),
        crossDomain: true,
        async: true,
        beforeSend: function () { },
        success: function (res) {
          forums = res = JSON.parse(res);
          forumsSrc = [];
          for (var i = 0; i < res.length; i++) {
            forumsSrc.push(res[i].title_clean.replace(`'`, `"`));
          }
          response(forumsSrc);
        }
      });
    },
    minLength: 2/*,
    select: function (event, ui) {
      var forum = searchIn(forums, ui.item.value, 'title_clean');
      $('#forum-id').val(forum.forumid);
    }*/
  });

  $('#copy-btn').on('click', function () {
    copyToClipboard(generated_code);

    if (getVal(choose_type) == 'declaration-weekly-challenges') {
      window.open(`https://www.fxp.co.il/newreply.php?p=${challenges_thread_reply_link}&noquote=1`);
    } else {
      var user_id = new URL(profile_url).searchParams.get('u');
      window.open(`https://www.fxp.co.il/private.php?do=newpm&u=${user_id}`);
    }
  });

  $("#details-form").on('submit', function (e) {
    e.preventDefault();

    //bars_loader.slideDown(10);
    // setTimeout(function () {
    runValidations();

    if (valid) {
      var generated_code_section = $('#generated-code-section');

      generated_code_section.slideUp();

      switch (getVal(choose_type)) {
        case 'declaration-weekly-challenges':
          fxp_placeholder.load(proxyUrl + encodeURIComponent("https://www.fxp.co.il/" + getVal(forum_name).replace(' ', '_')) + '/ #stickies a.title:contains("שבוע")', function () {
            challenges_thread = fxp_base_url + $(this).find('.title').first().attr('href');
            $(this).empty();
          });

          $.get("server.php", {
            thread: challenges_thread,
            type: "GET"
          }).done(function (data) {
            forum_logo = $(data).find('.postbit').first().find('.mainimg img').first();
            forum_logo = forum_logo.attr('src') || forum_logo.data('src');
            forum_logo = forum_logo && fileExists(forum_logo) ? forum_logo : "https://static.fcdn.co.il/images3/logo-fxp.png";
            challenges_thread_reply_link = $(data).find('.postbit').last().attr('id');
            challenges_thread_reply_link = challenges_thread_reply_link ? challenges_thread_reply_link.replace('post_', '') : '';
          });

          if (getVal(thread_link)) {

            $.get("server.php", {
              thread: getVal(thread_link),
              type: "GET"
            }).done(function (data) {
              var link = $(data).find('a.username').first();
              profile_url_thread = fxp_base_url + link.attr('href');
              user_name_thread = link.text();
              thread_title = $(data).find('h1').text();
            });
          }
          generated_code.text(generate_declaration_weekly_challenges());
          break;
        case 'pm-winner': case 'pm-nick': case 'pm-subnick-text': case 'pm-subnick-img': case 'pm-champ': case 'pm-fxp-points':
          fxp_placeholder.load(proxyUrl + encodeURIComponent(getVal(thread_link)) + ' .titleshowt h1', function () {
            challenge_title = $(this).find('h1').text();
            $(this).empty();
          });

          switch (getVal(choose_type)) {
            case 'pm-winner':
              generated_code.text(generate_pm_winner());
              break;
            case 'pm-nick':
              generated_code.text(`ברכותיי, ${getVal(name)}!
זכית באתגר "${getVal(challenge_title)}" בפורום ${getVal(forum_name)}, דבר המעניק לך [B][COLOR="#008000"]שינוי ניק[/COLOR][/B].
[U][B]מהו שינוי ניק?[/B][/U]
משתמש אשר זכה באתגר אחד או יותר ברחבי האתר וקיבל שינוי ניק, רשאי לשנות את ניק המשתמש שלו (שם המשתמש) לכל ניק פנוי שירצה.
כיצד בודקים האם הניק פנוי? כותבים אותו במקום ה־"X" שבקישור [URL="https://www.fxp.co.il/member.php?username=X"]הזה[/URL], ובודקים אם קיים פרופיל כזה או לא; אם לא – הניק פנוי, אם כן – הניק תפוס.
בכדי לממש את שינוי הניק, יש לפתוח אשכול ב[URL="https://www.fxp.co.il/forumdisplay.php?f=4723"]תת פורום פרסים[/URL], על־פי [URL="https://www.fxp.co.il/showthread.php?t=10946798"]הטופס המתאים[/URL].
[B]שימ/י לב – ניתן לממש את שינוי הניק תוך מקסימום חודשיים לאחר הזכייה.[/B]
בברכה, ${getVal(mod_name)}.
מנהל/ת פורום ${getVal(forum_name)}.`);
              break;
            case 'pm-subnick-text':
              generated_code.text(`ברכותיי, ${getVal(name)}!
זכית באתגר "${getVal(challenge_title)}" בפורום ${getVal(forum_name)}, דבר המעניק לך [B][COLOR="#ff0000"]שינוי תת־ניק טקסט ל־${getVal(days_count)} ימים[/COLOR][/B].
[U][B]מהו שינוי תת־ניק?[/B][/U]
תת־ניק זוהי השורה מתחת לשם המשתמש שלך (המציינת בדר"כ את דרגת המשתמש).
כאשר משתמש זוכה בשינוי תת־ניק, הוא יכול לבקש לשנות את תת־הניק שלו לטקסט (אלא אם זכה בשינוי תת־ניק לתמונה) לבחירתו. את שינוי תת־הניק תוכלו לבקש בפורום [URL="https://www.fxp.co.il/forumdisplay.php?f=4723"]פרסים[/URL].
בברכה, ${getVal(mod_name)}.
מנהל/ת פורום ${getVal(forum_name)}.`);
              break;
            case 'pm-subnick-img':
              generated_code.text(`ברכותיי, ${getVal(name)}!
זכית באתגר "${getVal(challenge_title)}" בפורום ${getVal(forum_name)}, דבר המעניק לך [B][COLOR="#ff0000"]שינוי תת־ניק תמונה ל־${getVal(days_count)} ימים[/COLOR][/B].
[U][B]מהו שינוי תת־ניק?[/B][/U]
תת־ניק זוהי השורה מתחת לשם המשתמש שלך (המציינת בדר"כ את דרגת המשתמש).
כאשר משתמש זוכה בשינוי תת־ניק, הוא יכול לבקש לשנות את תת־הניק שלו לטקסט (אלא אם זכה בשינוי תת־ניק לתמונה) לבחירתו. את שינוי תת־הניק תוכלו לבקש בפורום [URL="https://www.fxp.co.il/forumdisplay.php?f=4723"]פרסים[/URL].
בברכה, ${getVal(mod_name)}.
מנהל/ת פורום ${getVal(forum_name)}.`);
              break;
            case 'pm-champ':
              generated_code.text(`ברכותיי, ${getVal(name)}!
זכית באתגר "${getVal(challenge_title)}" בפורום ${getVal(forum_name)}, דבר המעניק לך [B][COLOR=#daa520]נקודה לצ'אמפ[/COLOR][/B].
[U][B]מהי נקודה לצ'אמפ?[/B][/U]
משתמש אשר זכה באתגר אחד או יותר ברחבי האתר וקיבל נקודה לצ'אמפ, אינו זכאי לפרס או לדרגה כלשהם, אך אם הוא צובר 8 נקודות לצ'אמפ, הוא מקבל את דרגת ה־[B][COLOR=#daa520]Fxp Champ[/COLOR][/B] הנחשקת.
במידה ואתם זכאים ל־8 נקודות צ'אמפ ומעלה (ניתן לברר את זכאותכם בפורום [URL="https://www.fxp.co.il/forumdisplay.php?f=4723"]פרסים[/URL]), תוכלו לבקש להפעיל את הדרגה בפורום [URL="https://www.fxp.co.il/forumdisplay.php?f=4723"]פרסים[/URL].
פרטים נוספים על דרגת ה־[B][COLOR=#daa520]Fxp Champ[/COLOR][/B] תוכל/י למצוא [URL="https://www.fxp.co.il/showthread.php?t=860344"]כאן[/URL].
בברכה, ${getVal(mod_name)}.
מנהל/ת פורום ${getVal(forum_name)}.`);
              break;

            case 'pm-fxp-points':
              generated_code.text(`ברכותיי, ${getVal(name)}!
זכית באתגר "${getVal(challenge_title)}" בפורום ${getVal(forum_name)}, דבר המעניק לך [B][COLOR=yellowgreen]${getVal(days_count)} נקודות FxP[/COLOR][/B].
[U][B]מהן נקודות FxP?[/B][/U]
נקודות FxP הן נקודות אשר ניתן להשיג ברחבי האתר, באתגרים ופעילויות שונות.
הדרך הראשית להשגת נקודות FxP היא דרך פורום [URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43c6db]היכל התהילה[/COLOR][/URL]. הנקודות מצטברות בזכאות של כל משתמש ואפשר לחסוך אותן.
באמצעות נקודות FxP ניתן לרכוש פרסים שונים כדוגמת ימי Winner, שינויי ניק, תת־ניק ועוד. 
השימוש בנקודות FxP נעשה דרך תת הפורום [URL="https://www.fxp.co.il/forumdisplay.php?f=4723"]פרסים[/URL], בו ניתן לשאול כמה נקודות FxP ברשותכם ולרכוש פרסים שווים מ[URL="https://www.fxp.co.il/showthread.php?t=15814667"]חנות הפרסים[/URL].
בברכה, ${getVal(mod_name)}.
מנהל/ת פורום ${getVal(forum_name)}.`);
          }
          break;
      }

      generated_code_section.slideDown();
      $('#copy-btn').focus().scrollToIt();
    }

    // bars_loader.slideUp();
    //}, 500);
  });

  choose_type.on('change', function () {
    clearValidations()

    var details_section = $('#details-section');
    details_section.slideUp();
    $('#msg').slideUp();
    $('#generated-code-section').slideUp();
    $('#user-name').attr('placeholder', 'ניק הזוכה');
    $('#thread-link').attr('placeholder', 'קישור לאתגר').addClass('full-width');
    $('#choose-role').slideUp();
    $('#days-count, #weekly-challenges-note').hide();
    $('#mod-name').show();
    $('#forum-name, #user-name').removeClass('half-width');

    switch ($(this).val()) {
      case 'declaration-weekly-challenges':
        $('#msg').slideDown();
        $('#user-name').attr('placeholder', 'ניק המשקיען');
        $('#thread-link').attr('placeholder', 'קישור לאשכול (הזוכה)');
        $('#weekly-challenges-note').show();
        $('#mod-name').hide();
        $('#forum-name, #user-name').addClass('half-width');
        details_section.slideDown().scrollToIt().find('input').first().focus();
        break;
      case 'pm-winner':
        $('#choose-role').slideDown().scrollToIt().focus();
        $('#thread-link').removeClass('full-width');
        $('#days-count').show();
        break;
      case 'pm-subnick-text': case 'pm-subnick-img': case 'pm-fxp-points':
        $('#thread-link').removeClass('full-width');
        $('#days-count').show();
      case 'pm-nick': case 'pm-subnick-text': case 'pm-subnick-img': case 'pm-champ':
        details_section.slideDown().scrollToIt().find('input').first().focus();
        break;
    }
  });

  $('#choose-role').on('change', function () {
    $('#details-section').slideDown().scrollToIt().find('input').first().focus();
  });

  $('#nightmode-btn').on('click', function () {
    $('html').toggleClass('nightModeActive');
  });
  if (!window.matchMedia('(prefers-color-scheme: dark)').matches)
    $('#nightmode-btn').click();

  $.fn.scrollToIt = function () {
    var thisEl = this
    $('html, body').animate({
      scrollTop: thisEl.offset().top
    }, 1000);
    return this
  };

  function searchIn(arr, s, key) {
    var i, key;
    s = s.replace(`"`, `'`);
    for (i = arr.length; i--;) {
      if (key) {
        if (arr[i].hasOwnProperty(key) && arr[i][key] == s) {
          return arr[i];
        }
      } else {
        for (key in arr[i]) {
          if (arr[i].hasOwnProperty(key) && arr[i][key].indexOf(s) > -1) {
            return arr[i];
          }
        }
      }
    }
    return null;
  };

  function fileExists(url) {
    var response = $.ajax({
      url: proxyUrl + url.trim(),
      type: 'HEAD',
      //crossDomain: true,
      async: false
    });
    return (response.status != "200") ? false : true;
  }

  function copyToClipboard(el) {
    el = el[0];
    const isIOSDevice = navigator.userAgent.match(/ipad|ipod|iphone/i);
    isIOSDevice ? el.setSelectionRange(0, el.value.length) : el.select();
    document.execCommand('copy');
  }

  function getVal(el) {
    return typeof el == 'object' ? el.val().trim() : el;
  }

  function generate_declaration_weekly_challenges() {
    var date = new Date().toLocaleDateString("he-IL", {
      "year": "2-digit",
      "month": "2-digit",
      "day": "2-digit"
    }),
      bbCode = `[CENTER][FONT=Open Sans Hebrew][B][IMG]${getVal(forum_logo)}[/IMG]
    [COLOR=#008080][SIZE=4]משקיען ואשכול השבוע - ${getVal(forum_name)}[/SIZE][/COLOR]
    גולשים יקרים!
    כמדי שבוע, יבחר המשתמש אשר השקיע ובלט מבין שאר הגולשים ואשכול מושקע ו/או שעניין את הגולשים.
    [U]אז, קבלו את משקיען ואשכול השבוע לתאריך [COLOR=#008080]${date}[/COLOR] בפורום ${getVal(forum_name)}:[/U]
    [IMG]https://images.weserv.nl/?url=i.imgur.com/49v3iQt.png[/IMG]
    `;

    if (getVal(user_name)) {
      bbCode += `[SUB][/SUB] [SIZE=5][URL="${getVal(profile_url)}"][COLOR=#daa520][SUP][U]${getVal(user_name)}[/U][/SUP][/COLOR][/URL][/SIZE] [SUB][/SUB]`;
    } else {
      bbCode += `[SIZE=4][COLOR=#daa520][SUP]לצערנו לא נמצא משקיען[/SUP][/COLOR][/SIZE]`;
    }

    bbCode += `
    [IMG]https://images.weserv.nl/?url=i.imgur.com/Rb4j5af.png[/IMG]
    `;

    if (getVal(thread_link)) {
      bbCode += `[SIZE=5][URL="${getVal(profile_url_thread)}"][COLOR=#daa520][SUP][U]${getVal(user_name_thread)}[/U][/SUP][/COLOR][/URL][/SIZE] [SUB][/SUB]
    [SUB][SIZE=2][COLOR=#daa520][U]אשר פתח את האשכול:[/U] "[U][URL="${getVal(thread_link)}"]${getVal(thread_title)}[/URL][/U]"[/COLOR][/SIZE][/SUB]`;
    } else {
      bbCode += `[SIZE=4][COLOR=#daa520][SUP]לצערנו לא נמצא אשכול[/SUP][/COLOR][/SIZE]`;
    }

    bbCode += `
    [COLOR=#333333]---------[/COLOR]
    `;

    if (getVal(user_name) && getVal(user_name_thread)) {
      bbCode += `[SIZE=2][URL="${getVal(profile_url)}"][COLOR=#008080]${getVal(user_name)}[/COLOR][/URL][/SIZE] ו־[SIZE=2][URL="${getVal(profile_url_thread)}"][COLOR=#008080]${getVal(user_name_thread)}[/COLOR][/URL][/SIZE], זוכים בלא פחות מ־7 ימי ווינר כל אחד.
      [SUB][COLOR=#008080][SIZE=3]מזל טוב ובהצלחה לכולם בשבוע הבא![/SIZE][/COLOR][/SUB]`;
    } else if (getVal(user_name) || getVal(user_name_thread)) {
      bbCode += `[SIZE=2][URL="${getVal(profile_url) || getVal(profile_url_thread)}"][COLOR=#008080]${getVal(user_name) || getVal(user_name_thread)}[/COLOR][/URL][/SIZE] זוכה בלא פחות מ־7 ימי ווינר.
      [SUB][COLOR=#008080][SIZE=3]מזל טוב ובהצלחה לכולם בשבוע הבא![/SIZE][/COLOR][/SUB]`;
    } else {
      bbCode += `[SUB][COLOR=#008080][SIZE=3]בהצלחה לכולם בשבוע הבא![/SIZE][/COLOR][/SUB]`;
    }

    bbCode += `
    [COLOR=#333333]---------[/COLOR]
    בברכה,
    הנהלת פורום ${getVal(forum_name)} :flowers:
    [/B][/FONT][/CENTER]`;

    return bbCode;
  }

  function generate_pm_winner() {
    var bbCode = `ברכותיי, ${getVal(name)}!
זכית באתגר "${getVal(challenge_title)}" בפורום ${getVal(forum_name)}, דבר המעניק לך [COLOR=#2bb1e2][B]${getVal(days_count)} ימי Winner[/B][/COLOR].
[U][B]מהי דרגת ה־Winner?[/B][/U]
`;

    switch (getVal(choose_role)) {
      case 'user-got-prize':
        bbCode += `דרגה זו ניתנת למשתמש אשר זכה באתגר אחד או יותר ברחבי האתר. דרגה זו ניתנת לזמן מוגבל (בהתאם לאתגר) ומקנה למשתמש הזוכה צבע שם משתמש בצבע תכלת וסמל של הדרגה ליד כינויו, תת ניק מעוצב של "FxP Winner" וגישה לפורום "[URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43c6db]היכל התהילה[/COLOR][/URL]".
[B]ווינר/ית חדש/ה? אין לכם/ן שמץ מהו [URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43C6DB]פורום היכל התהילה[/COLOR][/URL]? [URL="https://www.fxp.co.il/showthread.php?t=2758803&p=119477099#post119477099"][U]לחצו כאן[/U][/URL] לקבלת הסבר מלא על פורום היכל התהילה![/B]`;
        break;
      case 'user-entitled-prize':
        bbCode += `דרגה זו ניתנת למשתמש אשר זכה באתגר אחד או יותר ברחבי האתר. דרגה זו ניתנת לזמן מוגבל (בהתאם לאתגר) ומקנה למשתמש הזוכה צבע שם משתמש בצבע תכלת וסמל של הדרגה ליד כינויו, תת ניק מעוצב של "FxP Winner" וגישה לפורום "[URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43c6db]היכל התהילה[/COLOR][/URL]".
[B]ווינר/ית חדש/ה? אין לכם/ן שמץ מהו [URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43C6DB]פורום היכל התהילה[/COLOR][/URL]? [URL="https://www.fxp.co.il/showthread.php?t=2758803&p=119477099#post119477099"][U]לחצו כאן[/U][/URL] לקבלת הסבר מלא על פורום היכל התהילה!
[/B]
 כיוון שאת/ה נוכח/ת כעת בדרגת ה־Winner, לא תקבל/י עכשיו את ימי הווינר, אך את/ה זכאי/ת להם, ותוכל/י לממשם באמצעות פתיחת אשכול ב[URL="https://www.fxp.co.il/forumdisplay.php?f=4723"]תת פורום פרסים[/URL] :)`;
        break;
      case 'mod-entitled':
        bbCode += `דרגה זו ניתנת למשתמש אשר זכה באתגר אחד או יותר ברחבי האתר. דרגה זו ניתנת לזמן מוגבל (בהתאם לאתגר) ומקנה למנהל הזוכה צבע שם משתמש בולט, כוכב מסתובב ליד שם המשתמש וגישה לפורום "[URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43c6db]היכל התהילה[/COLOR][/URL]".
[B]ווינר/ית חדש/ה? אין לכם/ן שמץ מהו [URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43C6DB]פורום היכל התהילה[/COLOR][/URL]? [URL="https://www.fxp.co.il/showthread.php?t=2758803&p=119477099#post119477099"][U]לחצו כאן[/U][/URL] לקבלת הסבר מלא על פורום היכל התהילה!
[/B]
משום שאת/ה מנהל/ת, לא תקבל/י עכשיו את ימי הווינר, אך את/ה זכאי/ת להם, ותוכל/י לממשם באמצעות פתיחת אשכול ב[URL="https://www.fxp.co.il/forumdisplay.php?f=4723"]תת פורום פרסים[/URL] :)`;
        break;
      case 'team-entitled':
        bbCode += `דרגה זו ניתנת למשתמש אשר זכה באתגר אחד או יותר ברחבי האתר. דרגה זו ניתנת לזמן מוגבל (בהתאם לאתגר) ומקנה למשתמש גישה לפורום "[URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43c6db]היכל התהילה[/COLOR][/URL]".
[B]ווינר/ית חדש/ה? אין לכם/ן שמץ מהו [URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43C6DB]פורום היכל התהילה[/COLOR][/URL]? [URL="https://www.fxp.co.il/showthread.php?t=2758803&p=119477099#post119477099"][U]לחצו כאן[/U][/URL] לקבלת הסבר מלא על פורום היכל התהילה!
[/B]
כיוון שאת/ה חבר/ת צוות, לא תקבל/י עכשיו את ימי הווינר, אך את/ה זכאי/ת להם, ותוכל/י לממשם כיוון שאת/ה חבר/ת צוות, יש לך גישה להיכל התהילה, לכן לא תקבל/י עכשיו את ימי הווינר, אך את/ה זכאי/ת להם :)`;
        break;
    }

    bbCode += `
את/ה מוזמנ/ת להיכנס לפורום [URL="https://www.fxp.co.il/forumdisplay.php?f=576"][COLOR=#43c6db]היכל התהילה[/COLOR][/URL] ולהנות! :)
בברכה, ${getVal(mod_name)}.
מנהל/ת פורום ${getVal(forum_name)}.`;
    return bbCode;
  }


  function addError(el, msg) {
    el.addClass('has-error');
    errors.push(msg);
    valid = false;
  }

  function clearValidations() {
    $('.has-error').removeClass('has-error');
    errors = [];
    valid = true;
    errMsg.slideUp();
  }

  function runValidations() {
    clearValidations();

    if (!getVal(forum_name)) {
      addError(forum_name, 'יש להזין את שם הפורום');
    } /*else if (!getVal(forum_id)) {
      addError(forum_id, 'יש לבחור פורום מההשלמה האוטומטית');
    }*/ else {
      fxp_placeholder.load(proxyUrl + encodeURIComponent("https://www.fxp.co.il/" + getVal(forum_name).replace(' ', '_')) + '/ .ntitle', function () {
        if (!$(this).find('h1').first().text())
          addError(user_name, 'שם הפורום שהוזן לא תקין');
        $(this).empty();
      });
    }

    if (getVal(choose_type) != 'declaration-weekly-challenges') {
      if (!getVal(user_name)) {
        addError(user_name, 'יש להזין את ניק הזוכה');
      }

      if (!getVal(thread_link)) {
        addError(thread_link, 'יש להזין את הקישור לאתגר');
      }
    }

    if (getVal(thread_link) && !getVal(thread_link).startsWith('https://www.fxp.co.il/showthread.php')) {
      addError(thread_link, 'יש להזין קישור תקין לאשכול');
    }

    if (getVal(user_name)) {
      fxp_placeholder.load(proxyUrl + encodeURIComponent("https://www.fxp.co.il/member.php?username=" + getVal(user_name)) + ' #view-aboutme .subsubsectionhead:first + dl,link[rel="canonical"]', function () {
        if (!$(this).find('link').first().attr('href')) {
          addError(user_name, 'הניק שהוזן לא קיים');
        } else {
          name = $(this).find('dt:contains("שם פרטי")').next('dd').text() || getVal(user_name);
          profile_url = $(this).find('link').first().attr('href');
        }
        $(this).empty();
      });
    }

    if (mod_name.is(':visible')) {
      if (!getVal(mod_name)) {
        addError(mod_name, 'יש להזין את שמכם הפרטי');
      }
    }

    if (days_count.is(':visible')) {
      if (!getVal(days_count)) {
        addError(days_count, 'יש להזין את כמות ימי הפרס');
      }
    }

    if (errors.length > 0) {
      var errorsUl = errMsg.children('ul').empty();
      $.each(errors, function (i) {
        $('<li/>').text(errors[i]).appendTo(errorsUl);
      });

      errMsg.slideDown().scrollToIt();
    }
  }
});
