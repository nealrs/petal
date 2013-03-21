;(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
(function() {
  var $, api_base, append_com, authorize, client_id, err, load, load_reply, marked, petal, post_reply, proxy_url, render_body, test_token, test_un_reply, users;

  $ = jQuery;

  $.support.cors = true;

  api_base = "https://api.github.com/repos/";

  client_id = "2ae54488ab61bc732407";

  proxy_url = "http://petal.ap01.aws.af.cm";

  marked = require("marked");

  users = [];

  petal = {
    repo: "user/repo",
    issue_id: 1,
    init: function(repo, issue_id) {
      this.repo = repo;
      this.issue_id = issue_id;
      this.api_url = api_base + this.repo + "/issues/" + this.issue_id + "/comments";
      $(".petal").append('<div class="comments"></div><div class="reply" ></div><div class="footer"></div>');
      return load();
    }
  };

  $.petal = petal;

  render_body = function(com_body) {
    var str;
    str = com_body.replace(/\*Comment from http[s]?:\/\/(.*)\*$/, "");
    str = marked(str);
    return str.replace(/\B@([\w-]+)/gm, '<a href="https://github.com/$1" target="_blank">@$1</a>');
  };

  append_com = function(com) {
    $(".petal .comments ul").append('\
      <li>\
        <div class="user">\
          <img src="https://secure.gravatar.com/avatar/' + com.user.gravatar_id + '?s=50" />\
          <a class="username" href="https://github.com/' + com.user.login + '" >' + com.user.login + '</a>\
        </div>\
        <div class="content">\
          <div class="body" >' + render_body(com.body) + '</div>\
          <p class="date">' + com.updated_at.slice(0, 10) + '</p>\
        </div>\
      </li>\
  ');
    users.push(com.user.login);
    return users = $.unique(users);
  };

  load = function() {
    return $.getJSON(petal.api_url + "?callback=?", function(response) {
      var com, comments, _i, _len;
      comments = response.data;
      $(".petal .comments").append("<ul></ul>");
      for (_i = 0, _len = comments.length; _i < _len; _i++) {
        com = comments[_i];
        append_com(com);
      }
      return load_reply();
    });
  };

  load_reply = function() {
    $(".petal .reply").append('\
    <p class="note">*Require Github account<a id="issue-src" href="https://github.com/' + petal.repo + '/issues/' + petal.issue_id + '">' + petal.repo + '/issues/' + petal.issue_id + '</a></p>\
    <p class="err"></p>\
    <textarea id="petal-textarea"></textarea>\
    <p class="note" >Press <a href="javascript:void(0);">Ctrl+Enter</a> to post your comment.(Comments are parsed with <a href="http://github.github.com/github-flavored-markdown">GitHub Flavored Markdown</a>)</p>\
  ');
    $(".petal .footer").html('By <a href="https://github.com/hit9/petal/">petal</a>');
    test_token();
    test_un_reply();
    $("#petal-textarea").keydown(function(e) {
      var content;
      if (e.keyCode === 10 || e.keyCode === 13 && e.ctrlKey) {
        content = $("#petal-textarea").val();
        if (content) {
          return post_reply(content);
        } else {
          return err("Comment field was blank");
        }
      }
    });
    return $("#petal-textarea").atwho("@", {
      data: users
    });
  };

  post_reply = function(content) {
    var storage, token;
    storage = window.localStorage;
    token = storage.getItem("petaltoken");
    if (token === null) {
      storage.setItem("petal_un_reply", content);
      return authorize();
    }
    content += "\n *Comment from " + url().replace(/\?$/, "") + "*";
    return $.ajax({
      type: "post",
      url: petal.api_url,
      dataType: "json",
      data: JSON.stringify({
        'body': content
      }),
      headers: {
        Authorization: "token " + token,
        Accept: 'application/json'
      },
      success: function(response, status, jqXHR) {
        var un_reply;
        un_reply = storage.getItem("petal_un_reply");
        if (un_reply) {
          storage.removeItem("petal_un_reply");
        }
        append_com(response);
        return $("#petal-textarea").val("");
      },
      error: function(jqXHR, error, errorThrown) {
        if (jqXHR.status && jqXHR.status === 401) {
          storage.setItem("petal_un_reply", content);
          return authorize();
        } else {
          return err("Something wrong.");
        }
      }
    });
  };

  authorize = function() {
    var authorize_url, _url;
    authorize_url = "https://github.com/login/oauth/authorize";
    _url = authorize_url + "?client_id=" + client_id + "&scope=public_repo,user&redirect_uri=" + proxy_url + "/?callback=" + url();
    return window.location.replace(_url);
  };

  test_un_reply = function() {
    var un_reply;
    un_reply = window.localStorage.getItem("petal_un_reply");
    if (un_reply) {
      return post_reply(un_reply);
    }
  };

  test_token = function() {
    var storage, token;
    token = url("?petaltoken");
    if (token) {
      token = token.replace(/^\/|\/$/g, '');
      storage = window.localStorage;
      storage.setItem("petaltoken", token);
      return window.history.pushState("", document.title, removeParameter(unescape(url()).replace(/\/$/, ''), "petaltoken").replace(/\?$/, ""));
    }
  };

  err = function(msg) {
    $(".petal .err").text(msg);
    $(".petal .err").show();
    return $(".petal .err").delay(7000).fadeOut(300);
  };

}).call(this);

// Generated by CoffeeScript 1.5.0-pre

},{"marked":2}],2:[function(require,module,exports){
(function(global){/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){3,} *\n*/,
  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!' + block.gfm.fences.source.replace('\\1', '\\2') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i+1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item[item.length-1] === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre',
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1][cap[1].length-1] === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([^\s]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1][6] === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // url (gfm)
    if (cap = this.rules.url.exec(src)) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0][0];
        src = cap[0].substring(1) + src;
        continue;
      }
      out += this.outputLink(cap, link);
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<strong>'
        + this.output(cap[2] || cap[1])
        + '</strong>';
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<em>'
        + this.output(cap[2] || cap[1])
        + '</em>';
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<code>'
        + escape(cap[2], true)
        + '</code>';
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<br>';
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<del>'
        + this.output(cap[1])
        + '</del>';
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(cap[0]);
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  if (cap[0][0] !== '!') {
    return '<a href="'
      + escape(link.href)
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + '>'
      + this.output(cap[1])
      + '</a>';
  } else {
    return '<img src="'
      + escape(link.href)
      + '" alt="'
      + escape(cap[1])
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + '>';
  }
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options) {
  var parser = new Parser(options);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length-1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return '<hr>\n';
    }
    case 'heading': {
      return '<h'
        + this.token.depth
        + '>'
        + this.inline.output(this.token.text)
        + '</h'
        + this.token.depth
        + '>\n';
    }
    case 'code': {
      if (this.options.highlight) {
        var code = this.options.highlight(this.token.text, this.token.lang);
        if (code != null && code !== this.token.text) {
          this.token.escaped = true;
          this.token.text = code;
        }
      }

      if (!this.token.escaped) {
        this.token.text = escape(this.token.text, true);
      }

      return '<pre><code'
        + (this.token.lang
        ? ' class="'
        + this.options.langPrefix
        + this.token.lang
        + '"'
        : '')
        + '>'
        + this.token.text
        + '</code></pre>\n';
    }
    case 'table': {
      var body = ''
        , heading
        , i
        , row
        , cell
        , j;

      // header
      body += '<thead>\n<tr>\n';
      for (i = 0; i < this.token.header.length; i++) {
        heading = this.inline.output(this.token.header[i]);
        body += this.token.align[i]
          ? '<th align="' + this.token.align[i] + '">' + heading + '</th>\n'
          : '<th>' + heading + '</th>\n';
      }
      body += '</tr>\n</thead>\n';

      // body
      body += '<tbody>\n'
      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];
        body += '<tr>\n';
        for (j = 0; j < row.length; j++) {
          cell = this.inline.output(row[j]);
          body += this.token.align[j]
            ? '<td align="' + this.token.align[j] + '">' + cell + '</td>\n'
            : '<td>' + cell + '</td>\n';
        }
        body += '</tr>\n';
      }
      body += '</tbody>\n';

      return '<table>\n'
        + body
        + '</table>\n';
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return '<blockquote>\n'
        + body
        + '</blockquote>\n';
    }
    case 'list_start': {
      var type = this.token.ordered ? 'ol' : 'ul'
        , body = '';

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return '<'
        + type
        + '>\n'
        + body
        + '</'
        + type
        + '>\n';
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'html': {
      return !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
    }
    case 'paragraph': {
      return '<p>'
        + this.inline.output(this.token.text)
        + '</p>\n';
    }
    case 'text': {
      return '<p>'
        + this.parseText()
        + '</p>\n';
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}

/**
 * Marked
 */

function marked(src, opt) {
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-'
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

})(window)
},{}]},{},[1])
;
/******************************************
 * Websanova.com
 *
 * Resources for web entrepreneurs
 *
 * @author          Websanova
 * @copyright       Copyright (c) 2012 Websanova.
 * @license         This websanova JavaScript url is dual licensed under the MIT and GPL licenses.
 * @link            http://www.websanova.com
 * @github          http://github.com/websanova/js-url
 * @version			1.7.6
 *
 ******************************************/

window.url = (function() {
	function isNumeric(arg) {
	  return !isNaN(parseFloat(arg)) && isFinite(arg);
	}
	
	return function url(arg, url) {
		var _ls = url || window.location.toString();

		if(_ls.substring(0,2) === '//') _ls = 'http:' + _ls;
		else if(_ls.split('://').length === 1) _ls = 'http://' + _ls;

		url = _ls.split('/');
		var _l = {auth:''}, host = url[2].split('@');

		if(host.length === 1) host = host[0].split(':');
		else{ _l.auth = host[0]; host = host[1].split(':'); }

		_l.protocol=url[0], _l.hostname=host[0], _l.port=(host[1]||'80'), _l.pathname='/' + url.slice(3, url.length).join('/').split('?')[0].split('#')[0];
		var _p = _l.pathname;
		if(_p.split('.').length === 1 && _p[_p.length-1] !== '/') _p += '/';
		var _h = _l.hostname, _hs = _h.split('.'), _ps = _p.split('/');

		if(!arg) return _ls;
		else if(arg === 'hostname') return _h;
		else if(arg === 'domain') return _hs.slice(-2).join('.');
		else if(arg === 'tld') return _hs.slice(-1).join('.');
		else if(arg === 'sub') return _hs.slice(0, _hs.length - 2).join('.');
		else if(arg === 'port') return _l.port || '80';
		else if(arg === 'protocol') return _l.protocol.split(':')[0];
		else if(arg === 'auth') return _l.auth;
		else if(arg === 'user') return _l.auth.split(':')[0];
		else if(arg === 'pass') return _l.auth.split(':')[1] || '';
		else if(arg === 'path') return _p;
		else if(arg[0] === '.')
		{
			arg = arg.substring(1);
			if(isNumeric(arg)) {arg = parseInt(arg); return _hs[arg < 0 ? _hs.length + arg : arg-1] || ''; }
		}
		else if(isNumeric(arg)){ arg = parseInt(arg); return _ps[arg < 0 ? _ps.length - 1 + arg : arg] || ''; }
		else if(arg === 'file') return _ps.slice(-1)[0];
		else if(arg === 'filename') return _ps.slice(-1)[0].split('.')[0];
		else if(arg === 'fileext') return _ps.slice(-1)[0].split('.')[1] || '';
		else if(arg[0] === '?' || arg[0] === '#')
		{
			var params = _ls, param = null;

			if(arg[0] === '?') params = (params.split('?')[1] || '').split('#')[0];
			else if(arg[0] === '#') params = (params.split('#')[1] || '');

			if(!arg[1]) return params;

			arg = arg.substring(1);
			params = params.split('&');

			for(var i=0,ii=params.length; i<ii; i++)
			{
				param = params[i].split('=');
				if(param[0] === arg) return param[1];
			}

			return null;
		}

		return '';
	}
})();

function removeParameter(url, parameter)
{
  var urlparts= url.split('?');

  if (urlparts.length>=2)
  {
      var urlBase=urlparts.shift(); //get first part, and remove from array
      var queryString=urlparts.join("?"); //join it back up

      var prefix = encodeURIComponent(parameter)+'=';
      var pars = queryString.split(/[&;]/g);
      for (var i= pars.length; i-->0;)               //reverse iteration as may be destructive
          if (pars[i].lastIndexOf(prefix, 0)!==-1)   //idiom for string.startsWith
              pars.splice(i, 1);
      url = urlBase+'?'+pars.join('&');
  }
  return url;
}


/*
  Implement Github like autocomplete mentions
  http://ichord.github.com/At.js

  Copyright (c) 2013 chord.luo@gmail.com
  Licensed under the MIT license.
*/


(function() {

  (function(factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['jquery'], factory);
    } else {
      return factory(window.jQuery);
    }
  })(function($) {
    var Controller, DEFAULT_CALLBACKS, DEFAULT_TPL, KEY_CODE, Mirror, View;
    Mirror = (function() {

      Mirror.prototype.css_attr = ["overflowY", "height", "width", "paddingTop", "paddingLeft", "paddingRight", "paddingBottom", "marginTop", "marginLeft", "marginRight", "marginBottom", "fontFamily", "borderStyle", "borderWidth", "wordWrap", "fontSize", "lineHeight", "overflowX", "text-align"];

      function Mirror($inputor) {
        this.$inputor = $inputor;
      }

      Mirror.prototype.copy_inputor_css = function() {
        var css,
          _this = this;
        css = {
          position: 'absolute',
          left: -9999,
          top: 0,
          zIndex: -20000,
          'white-space': 'pre-wrap'
        };
        $.each(this.css_attr, function(i, p) {
          return css[p] = _this.$inputor.css(p);
        });
        return css;
      };

      Mirror.prototype.create = function(html) {
        this.$mirror = $('<div></div>');
        this.$mirror.css(this.copy_inputor_css());
        this.$mirror.html(html);
        this.$inputor.after(this.$mirror);
        return this;
      };

      Mirror.prototype.get_flag_rect = function() {
        var $flag, pos, rect;
        $flag = this.$mirror.find("span#flag");
        pos = $flag.position();
        rect = {
          left: pos.left,
          top: pos.top,
          bottom: $flag.height() + pos.top
        };
        this.$mirror.remove();
        return rect;
      };

      return Mirror;

    })();
    KEY_CODE = {
      DOWN: 40,
      UP: 38,
      ESC: 27,
      TAB: 9,
      ENTER: 13
    };
    DEFAULT_CALLBACKS = {
      data_refactor: function(data) {
        if (!$.isArray(data)) {
          return data;
        }
        return $.map(data, function(item, k) {
          if (!$.isPlainObject(item)) {
            item = {
              name: item
            };
          }
          return item;
        });
      },
      matcher: function(flag, subtext) {
        var match, matched, regexp;
        regexp = new RegExp(flag + '([A-Za-z0-9_\+\-]*)$|' + flag + '([^\\x00-\\xff]*)$', 'gi');
        match = regexp.exec(subtext);
        matched = null;
        if (match) {
          matched = match[2] ? match[2] : match[1];
        }
        return matched;
      },
      filter: function(query, data, search_key) {
        var _this = this;
        return $.map(data, function(item, i) {
          var name;
          name = $.isPlainObject(item) ? item[search_key] : item;
          if (name.toLowerCase().indexOf(query) >= 0) {
            return item;
          }
        });
      },
      remote_filter: function(params, url, render_view) {
        return $.ajax(url, {
          data: params,
          success: function(data) {
            return render_view(data);
          }
        });
      },
      sorter: function(query, items, search_key) {
        var item, results, text, _i, _len;
        if (!query) {
          return items.sort(function(a, b) {
            if (a[search_key].toLowerCase() > b[search_key].toLowerCase()) {
              return 1;
            } else {
              return -1;
            }
          });
        }
        results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          text = item[search_key];
          item.order = text.toLowerCase().indexOf(query);
          results.push(item);
        }
        return results.sort(function(a, b) {
          return a.order - b.order;
        });
      },
      tpl_eval: function(tpl, map) {
        var el;
        try {
          return el = tpl.replace(/\$\{([^\}]*)\}/g, function(tag, key, pos) {
            return map[key];
          });
        } catch (error) {
          return "";
        }
      },
      highlighter: function(li, query) {
        if (!query) {
          return li;
        }
        return li.replace(new RegExp(">\\s*(\\w*)(" + query.replace("+", "\\+") + ")(\\w*)\\s*<", 'ig'), function(str, $1, $2, $3) {
          return '> ' + $1 + '<strong>' + $2 + '</strong>' + $3 + ' <';
        });
      },
      selector: function($li) {
        if ($li.length > 0) {
          return this.replace_str($li.data("value") || "");
        }
      }
    };
    Controller = (function() {

      function Controller(inputor) {
        this.settings = {};
        this.common_settings = {};
        this.pos = 0;
        this.flags = null;
        this.current_flag = null;
        this.query = null;
        this.$inputor = $(inputor);
        this.mirror = new Mirror(this.$inputor);
        this.common_settings = $.extend({}, $.fn.atwho["default"]);
        this.view = new View(this, this.$el);
        this.listen();
      }

      Controller.prototype.listen = function() {
        var _this = this;
        return this.$inputor.on('keyup.atwho', function(e) {
          return _this.on_keyup(e);
        }).on('keydown.atwho', function(e) {
          return _this.on_keydown(e);
        }).on('scroll.atwho', function(e) {
          return _this.view.hide();
        }).on('blur.atwho', function(e) {
          return _this.view.hide(_this.get_opt("display_timeout"));
        });
      };

      Controller.prototype.reg = function(flag, settings) {
        var current_settings, data;
        current_settings = {};
        current_settings = $.isPlainObject(flag) ? this.common_settings = $.extend({}, this.common_settings, flag) : !this.settings[flag] ? this.settings[flag] = $.extend({}, settings) : this.settings[flag] = $.extend({}, this.settings[flag], settings);
        data = current_settings["data"];
        current_settings["data"] = this.callbacks("data_refactor").call(this, data);
        return this;
      };

      Controller.prototype.trigger = function(name, data) {
        data || (data = []);
        data.push(this);
        return this.$inputor.trigger("" + name + ".atwho", data);
      };

      Controller.prototype.data = function(data) {
        if (data) {
          return this.$inputor.data("atwho-data", data);
        } else {
          return this.$inputor.data("atwho-data");
        }
      };

      Controller.prototype.callbacks = function(func_name) {
        var func;
        if (!(func = this.get_opt("callbacks", {})[func_name])) {
          func = this.common_settings["callbacks"][func_name];
        }
        return func;
      };

      Controller.prototype.get_opt = function(key, default_value) {
        var value;
        try {
          if (this.current_flag) {
            value = this.settings[this.current_flag][key];
          }
          if (value === void 0) {
            value = this.common_settings[key];
          }
          return value = value === void 0 ? default_value : value;
        } catch (e) {
          return value = default_value === void 0 ? null : default_value;
        }
      };

      Controller.prototype.rect = function() {
        var $inputor, Sel, at_rect, bottom, format, html, offset, start_range, x, y;
        $inputor = this.$inputor;
        if (document.selection) {
          Sel = document.selection.createRange();
          x = Sel.boundingLeft + $inputor.scrollLeft();
          y = Sel.boundingTop + $(window).scrollTop() + $inputor.scrollTop();
          bottom = y + Sel.boundingHeight;
          return {
            top: y - 2,
            left: x - 2,
            bottom: bottom - 2
          };
        }
        format = function(value) {
          return value.replace(/</g, '&lt').replace(/>/g, '&gt').replace(/`/g, '&#96').replace(/"/g, '&quot').replace(/\r\n|\r|\n/g, "<br />");
        };
        /* 克隆完inputor后将原来的文本内容根据
          @的位置进行分块,以获取@块在inputor(输入框)里的position
        */

        start_range = $inputor.val().slice(0, this.pos - 1);
        html = "<span>" + format(start_range) + "</span>";
        html += "<span id='flag'>?</span>";
        /*
                将inputor的 offset(相对于document)
                和@在inputor里的position相加
                就得到了@相对于document的offset.
                当然,还要加上行高和滚动条的偏移量.
        */

        offset = $inputor.offset();
        at_rect = this.mirror.create(html).get_flag_rect();
        x = offset.left + at_rect.left - $inputor.scrollLeft();
        y = offset.top - $inputor.scrollTop();
        bottom = y + at_rect.bottom;
        y += at_rect.top;
        return {
          top: y,
          left: x,
          bottom: bottom + 2
        };
      };

      Controller.prototype.catch_query = function() {
        var caret_pos, content, end, query, start, subtext,
          _this = this;
        content = this.$inputor.val();
        caret_pos = this.$inputor.caretPos();
        /* 向在插入符前的的文本进行正则匹配
         * 考虑会有多个 @ 的存在, 匹配离插入符最近的一个
        */

        subtext = content.slice(0, caret_pos);
        query = null;
        $.each(this.settings, function(flag, settings) {
          query = _this.callbacks("matcher").call(_this, flag, subtext);
          if (query != null) {
            _this.current_flag = flag;
            return false;
          }
        });
        if (typeof query === "string" && query.length <= 20) {
          start = caret_pos - query.length;
          end = start + query.length;
          this.pos = start;
          query = {
            'text': query.toLowerCase(),
            'head_pos': start,
            'end_pos': end
          };
          this.trigger("matched", [this.current_flag, query.text]);
        } else {
          this.view.hide();
        }
        return this.query = query;
      };

      Controller.prototype.replace_str = function(str) {
        var $inputor, flag_len, source, start_str, text;
        $inputor = this.$inputor;
        source = $inputor.val();
        flag_len = this.get_opt("display_flag") ? 0 : this.current_flag.length;
        start_str = source.slice(0, (this.query['head_pos'] || 0) - flag_len);
        text = "" + start_str + str + " " + (source.slice(this.query['end_pos'] || 0));
        $inputor.val(text);
        $inputor.caretPos(start_str.length + str.length + 1);
        return $inputor.change();
      };

      Controller.prototype.on_keyup = function(e) {
        switch (e.keyCode) {
          case KEY_CODE.ESC:
            e.preventDefault();
            this.view.hide();
            break;
          case KEY_CODE.DOWN:
          case KEY_CODE.UP:
            $.noop();
            break;
          default:
            this.look_up();
        }
        return e.stopPropagation();
      };

      Controller.prototype.on_keydown = function(e) {
        if (!this.view.visible()) {
          return;
        }
        switch (e.keyCode) {
          case KEY_CODE.ESC:
            e.preventDefault();
            this.view.hide();
            break;
          case KEY_CODE.UP:
            e.preventDefault();
            this.view.prev();
            break;
          case KEY_CODE.DOWN:
            e.preventDefault();
            this.view.next();
            break;
          case KEY_CODE.TAB:
          case KEY_CODE.ENTER:
            if (!this.view.visible()) {
              return;
            }
            e.preventDefault();
            this.view.choose();
            break;
          default:
            $.noop();
        }
        return e.stopPropagation();
      };

      Controller.prototype.render_view = function(data) {
        var search_key;
        search_key = this.get_opt("search_key");
        data = this.callbacks("sorter").call(this, this.query.text, data, search_key);
        data = data.splice(0, this.get_opt('limit'));
        this.data(data);
        return this.view.render(data);
      };

      Controller.prototype.remote_call = function(data, query) {
        var params, _callback;
        params = {
          q: query.text,
          limit: this.get_opt("limit")
        };
        _callback = function(data) {
          return this.render_view(data);
        };
        _callback = $.proxy(_callback, this);
        return this.callbacks('remote_filter').call(this, params, data, _callback);
      };

      Controller.prototype.look_up = function() {
        var data, query, search_key;
        query = this.catch_query();
        if (!query) {
          return false;
        }
        data = this.get_opt("data");
        search_key = this.get_opt("search_key");
        if (typeof data === "string") {
          this.remote_call(data, query);
        } else if ((data = this.callbacks('filter').call(this, query.text, data, search_key))) {
          this.render_view(data);
        } else {
          this.view.hide();
        }
        return $.noop();
      };

      return Controller;

    })();
    View = (function() {

      function View(controller) {
        this.controller = controller;
        this.id = this.controller.get_opt("view_id", "at-view");
        this.timeout_id = null;
        this.$el = $("#" + this.id);
        this.create_view();
      }

      View.prototype.create_view = function() {
        var $menu, tpl,
          _this = this;
        if (this.exist()) {
          return;
        }
        tpl = "<div id='" + this.id + "' class='at-view'><ul id='" + this.id + "-ul'></ul></div>";
        $("body").append(tpl);
        this.$el = $("#" + this.id);
        $menu = this.$el.find('ul');
        return $menu.on('mouseenter.view', 'li', function(e) {
          $menu.find('.cur').removeClass('cur');
          return $(e.currentTarget).addClass('cur');
        }).on('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          return _this.$el.data("_view").choose();
        });
      };

      View.prototype.exist = function() {
        return $("#" + this.id).length > 0;
      };

      View.prototype.visible = function() {
        return this.$el.is(":visible");
      };

      View.prototype.choose = function() {
        var $li;
        $li = this.$el.find(".cur");
        this.controller.callbacks("selector").call(this.controller, $li);
        this.controller.trigger("choose", [$li]);
        return this.hide();
      };

      View.prototype.reposition = function() {
        var offset, rect;
        rect = this.controller.rect();
        if (rect.bottom + this.$el.height() - $(window).scrollTop() > $(window).height()) {
          rect.bottom = rect.top - this.$el.height();
        }
        offset = {
          left: rect.left,
          top: rect.bottom
        };
        this.$el.offset(offset);
        return this.controller.trigger("reposition", [offset]);
      };

      View.prototype.next = function() {
        var cur, next;
        cur = this.$el.find('.cur').removeClass('cur');
        next = cur.next();
        if (!next.length) {
          next = $(this.$el.find('li')[0]);
        }
        return next.addClass('cur');
      };

      View.prototype.prev = function() {
        var cur, prev;
        cur = this.$el.find('.cur').removeClass('cur');
        prev = cur.prev();
        if (!prev.length) {
          prev = this.$el.find('li').last();
        }
        return prev.addClass('cur');
      };

      View.prototype.show = function() {
        if (!this.visible()) {
          this.$el.show();
        }
        return this.reposition();
      };

      View.prototype.hide = function(time) {
        var callback,
          _this = this;
        if (isNaN(time)) {
          if (this.visible()) {
            return this.$el.hide();
          }
        } else {
          callback = function() {
            return _this.hide();
          };
          clearTimeout(this.timeout_id);
          return this.timeout_id = setTimeout(callback, time);
        }
      };

      View.prototype.clear = function() {
        return this.$el.find('ul').empty();
      };

      View.prototype.render = function(list) {
        var $ul, tpl,
          _this = this;
        if (!$.isArray(list)) {
          return false;
        }
        if (list.length <= 0) {
          this.hide();
          return true;
        }
        this.clear();
        this.$el.data("_view", this);
        $ul = this.$el.find('ul');
        tpl = this.controller.get_opt('tpl', DEFAULT_TPL);
        $.each(list, function(i, item) {
          var $li, li;
          li = _this.controller.callbacks("tpl_eval").call(_this.controller, tpl, item);
          $li = $(_this.controller.callbacks("highlighter").call(_this.controller, li, _this.controller.query.text));
          $li.data("info", item);
          return $ul.append($li);
        });
        this.show();
        return $ul.find("li:eq(0)").addClass("cur");
      };

      return View;

    })();
    DEFAULT_TPL = "<li data-value='${name}'>${name}</li>";
    $.fn.atwho = function(flag, options) {
      return this.filter('textarea, input').each(function() {
        var $this, data;
        $this = $(this);
        data = $this.data("atwho");
        if (!data) {
          $this.data('atwho', (data = new Controller(this)));
        }
        return data.reg(flag, options);
      });
    };
    $.fn.atwho.Controller = Controller;
    $.fn.atwho.View = View;
    $.fn.atwho.Mirror = Mirror;
    return $.fn.atwho["default"] = {
      data: null,
      search_key: "name",
      callbacks: DEFAULT_CALLBACKS,
      limit: 5,
      display_flag: true,
      display_timeout: 300,
      tpl: DEFAULT_TPL
    };
  });

}).call(this);


/*
  Implement Github like autocomplete mentions
  http://ichord.github.com/At.js

  Copyright (c) 2013 chord.luo@gmail.com
  Licensed under the MIT license.
*/


/*
本插件操作 textarea 或者 input 内的插入符
只实现了获得插入符在文本框中的位置，我设置
插入符的位置.
*/


(function() {

  (function(factory) {
    if (typeof exports === 'object') {
      return factory(require('jquery'));
    } else if (typeof define === 'function' && define.amd) {
      return define(['jquery']);
    } else {
      return factory(window.jQuery);
    }
  })(function($) {
    var getCaretPos, setCaretPos;
    getCaretPos = function(inputor) {
      var end, endRange, len, normalizedValue, pos, range, start, textInputRange;
      if (document.selection) {
        /*
                #assume we select "HATE" in the inputor such as textarea -> { }.
                 *               start end-point.
                 *              /
                 * <  I really [HATE] IE   > between the brackets is the selection range.
                 *                   \
                 *                    end end-point.
        */

        range = document.selection.createRange();
        pos = 0;
        if (range && range.parentElement() === inputor) {
          normalizedValue = inputor.value.replace(/\r\n/g, "\n");
          /* SOMETIME !!!
           "/r/n" is counted as two char.
            one line is two, two will be four. balalala.
            so we have to using the normalized one's length.;
          */

          len = normalizedValue.length;
          /*
                       <[  I really HATE IE   ]>:
                        the whole content in the inputor will be the textInputRange.
          */

          textInputRange = inputor.createTextRange();
          /*                 _here must be the position of bookmark.
                           /
             <[  I really [HATE] IE   ]>
              [---------->[           ] : this is what moveToBookmark do.
             <   I really [[HATE] IE   ]> : here is result.
                            \ two brackets in should be in line.
          */

          textInputRange.moveToBookmark(range.getBookmark());
          endRange = inputor.createTextRange();
          /*  [--------------------->[] : if set false all end-point goto end.
            <  I really [[HATE] IE  []]>
          */

          endRange.collapse(false);
          /*
                                    ___VS____
                                   /         \
                     <   I really [[HATE] IE []]>
                                              \_endRange end-point.
          
                    " > -1" mean the start end-point will be the same or right to the end end-point
                   * simplelly, all in the end.
          */

          if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
            start = end = len;
          } else {
            /*
                                I really |HATE] IE   ]>
                                       <-|
                              I really[ [HATE] IE   ]>
                                    <-[
                            I reall[y  [HATE] IE   ]>
            
                          will return how many unit have moved.
            */

            start = -textInputRange.moveStart("character", -len);
            end = -textInputRange.moveEnd("character", -len);
          }
        }
      } else {
        start = inputor.selectionStart;
      }
      return start;
    };
    setCaretPos = function(inputor, pos) {
      var range;
      if (document.selection) {
        range = inputor.createTextRange();
        range.move("character", pos);
        return range.select();
      } else {
        return inputor.setSelectionRange(pos, pos);
      }
    };
    return $.fn.caretPos = function(pos) {
      var inputor;
      inputor = this[0];
      inputor.focus();
      if (pos) {
        return setCaretPos(inputor, pos);
      } else {
        return getCaretPos(inputor);
      }
    };
  });

}).call(this);
