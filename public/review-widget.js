
(function () {
  const t = globalThis,
    e =
      t.ShadowRoot &&
      (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) &&
      "adoptedStyleSheets" in Document.prototype &&
      "replace" in CSSStyleSheet.prototype,
    i = Symbol(),
    s = new WeakMap();
  let o = class {
    constructor(t, e, s) {
      if (((this._$cssResult$ = !0), s !== i))
        throw Error(
          "CSSResult is not constructable. Use `unsafeCSS` or `css` instead."
        );
      (this.cssText = t), (this.t = e);
    }
    get styleSheet() {
      let t = this.o;
      const i = this.t;
      if (e && void 0 === t) {
        const e = void 0 !== i && 1 === i.length;
        e && (t = s.get(i)),
          void 0 === t &&
            ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText),
            e && s.set(i, t));
      }
      return t;
    }
    toString() {
      return this.cssText;
    }
  };
  const r = (t, ...e) => {
      const s =
        1 === t.length
          ? t[0]
          : e.reduce(
              (e, i, s) =>
                e +
                ((t) => {
                  if (!0 === t._$cssResult$) return t.cssText;
                  if ("number" == typeof t) return t;
                  throw Error(
                    "Value passed to 'css' function must be a 'css' function result: " +
                      t +
                      ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security."
                  );
                })(i) +
                t[s + 1],
              t[0]
            );
      return new o(s, t, i);
    },
    a = e
      ? (t) => t
      : (t) =>
          t instanceof CSSStyleSheet
            ? ((t) => {
                let e = "";
                for (const i of t.cssRules) e += i.cssText;
                return ((t) => new o("string" == typeof t ? t : t + "", void 0, i))(e);
              })(t)
            : t;
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ var n, l;
  const d = globalThis,
    h = d.trustedTypes,
    c = h ? h.emptyScript : "",
    p = d.reactiveElementPolyfillSupport,
    g = (t, e) => t,
    u = {
      toAttribute(t, e) {
        switch (e) {
          case Boolean:
            t = t ? c : null;
            break;
          case Object:
          case Array:
            t = null == t ? t : JSON.stringify(t);
        }
        return t;
      },
      fromAttribute(t, e) {
        let i = t;
        switch (e) {
          case Boolean:
            i = null !== t;
            break;
          case Number:
            i = null === t ? null : Number(t);
            break;
          case Object:
          case Array:
            try {
              i = JSON.parse(t);
            } catch (t) {
              i = null;
            }
        }
        return i;
      },
    },
    m = (t, e) => !Object.is(t, e),
    f = {
      attribute: !0,
      type: String,
      converter: u,
      reflect: !1,
      hasChanged: m,
    };
  (null !== (n = Symbol.metadata) && void 0 !== n) || (Symbol.metadata = Symbol("metadata")),
    d.litPropertyMetadata || (d.litPropertyMetadata = new WeakMap());
  class v extends HTMLElement {
    static addInitializer(t) {
      this._$Ei(), (this.l ??= []).push(t);
    }
    static get observedAttributes() {
      return this.finalize(), this._$Eh && [...this._$Eh.keys()];
    }
    static createProperty(t, e = f) {
      if (
        (e.state && (e.attribute = !1),
        this._$Ei(),
        this.elementProperties.set(t, e),
        !e.noAccessor)
      ) {
        const i = Symbol(),
          s = this.getPropertyDescriptor(t, i, e);
        void 0 !== s && Object.defineProperty(this.prototype, t, s);
      }
    }
    static getPropertyDescriptor(t, e, i) {
      var s;
      const { get: o, set: r } =
        (null === (s = Object.getOwnPropertyDescriptor(this.prototype, t)) ||
        void 0 === s
          ? void 0
          : s) ?? {
          get() {
            return this[e];
          },
          set(t) {
            this[e] = t;
          },
        };
      return {
        get() {
          return o == null ? void 0 : o.call(this);
        },
        set(e) {
          const s = o == null ? void 0 : o.call(this);
          r.call(this, e), this.requestUpdate(t, s, i);
        },
        configurable: !0,
        enumerable: !0,
      };
    }
    static getPropertyOptions(t) {
      var e;
      return (
        (null === (e = this.elementProperties) || void 0 === e
          ? void 0
          : e.get(t)) ?? f
      );
    }
    static _$Ei() {
      if (this.hasOwnProperty(g("elementProperties"))) return;
      const t = Object.getPrototypeOf(this);
      t.finalize(),
        void 0 !== t.l && (this.l = [...t.l]),
        (this.elementProperties = new Map(t.elementProperties));
    }
    static finalize() {
      if (this.hasOwnProperty(g("finalized"))) return;
      if (((this.finalized = !0), this._$Ei(), this.hasOwnProperty(g("properties")))) {
        const t = this.properties,
          e = [
            ...Object.getOwnPropertyNames(t),
            ...Object.getOwnPropertySymbols(t),
          ];
        for (const i of e) this.createProperty(i, t[i]);
      }
      const t = this[Symbol.metadata];
      if (null !== t) {
        const e = litPropertyMetadata.get(t);
        if (void 0 !== e)
          for (const [t, i] of e) this.elementProperties.set(t, i);
      }
      this._$Eh = new Map();
      for (const [t, e] of this.elementProperties) {
        const i = this._$Eu(t, e);
        void 0 !== i && this._$Eh.set(i, t);
      }
      this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(t) {
      const e = [];
      if (Array.isArray(t)) {
        const i = new Set(t.flat(1 / 0).reverse());
        for (const t of i) e.unshift(a(t));
      } else void 0 !== t && e.push(a(t));
      return e;
    }
    static _$Eu(t, e) {
      const i = e.attribute;
      return !1 === i
        ? void 0
        : "string" == typeof i
        ? i
        : "string" == typeof t
        ? t.toLowerCase()
        : void 0;
    }
    constructor() {
      super(),
        (this._$Ep = void 0),
        (this.isUpdatePending = !1),
        (this.hasUpdated = !1),
        (this._$Em = null),
        this._$Ev();
    }
    _$Ev() {
      (this._$ES = new Promise((t) => (this.enableUpdating = t))),
        (this._$AL = new Map()),
        this._$E_(),
        this.requestUpdate(),
        null == this.constructor.l ||
          this.constructor.l.forEach((t) => t(this));
    }
    addController(t) {
      var e;
      (this._$EO ??= new Set()).add(t),
        void 0 !== this.renderRoot &&
          this.isConnected &&
          (null === (e = t.hostConnected) || void 0 === e || e.call(t));
    }
    removeController(t) {
      var e;
      null === (e = this._$EO) || void 0 === e || e.delete(t);
    }
    _$E_() {
      const t = new Map(),
        e = this.constructor.elementProperties;
      for (const i of e.keys())
        this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
      t.size > 0 && (this._$Ep = t);
    }
    createRenderRoot() {
      var t;
      const i =
        this.shadowRoot ??
        this.attachShadow(
          this.constructor.shadowRootOptions ?? this.constructor.shadowRootOptions
        );
      return (
        ((t, i) => {
          if (e)
            t.adoptedStyleSheets = i.map((t) =>
              t instanceof CSSStyleSheet ? t : t.styleSheet
            );
          else
            for (const e of i) {
              const i = document.createElement("style"),
                s = d.litNonce;
              void 0 !== s && i.setAttribute("nonce", s),
                (i.textContent = e.cssText),
                t.appendChild(i);
            }
        })(i, this.constructor.elementStyles),
        i
      );
    }
    connectedCallback() {
      var t;
      this.renderRoot ?? (this.renderRoot = this.createRenderRoot()),
        this.enableUpdating(!0),
        null === (t = this._$EO) ||
          void 0 === t ||
          t.forEach((t) => {
            var e;
            return null === (e = t.hostConnected) || void 0 === e
              ? void 0
              : e.call(t);
          });
    }
    enableUpdating(t) {}
    disconnectedCallback() {
      var t;
      null === (t = this._$EO) ||
        void 0 === t ||
        t.forEach((t) => {
          var e;
          return null === (e = t.hostDisconnected) || void 0 === e
            ? void 0
            : e.call(t);
        });
    }
    attributeChangedCallback(t, e, i) {
      this._$AK(t, i);
    }
    _$EC(t, e) {
      var i;
      const s = this.constructor.elementProperties.get(t),
        o = this.constructor._$Eu(t, s);
      if (void 0 !== o && !0 === s.reflect) {
        const r = (
          (null ===
            (i = null == s ? void 0 : s.converter) || void 0 === i
            ? void 0
            : i.toAttribute) !==
          void 0
            ? s.converter
            : u
        ).toAttribute(e, s.type);
        (this._$Em = t),
          null == r ? this.removeAttribute(o) : this.setAttribute(o, r),
          (this._$Em = null);
      }
    }
    _$AK(t, e) {
      var i;
      const s = this.constructor,
        o = s._$Eh.get(t);
      if (void 0 !== o && this._$Em !== o) {
        const t = s.getPropertyOptions(o),
          r =
            "function" == typeof t.converter
              ? { fromAttribute: t.converter }
              : (null ===
                  (i = null == t ? void 0 : t.converter) || void 0 === i
                  ? void 0
                  : i.fromAttribute) !==
                void 0
              ? t.converter
              : u;
        (this._$Em = o),
          (this[o] = r.fromAttribute(e, t.type)),
          (this._$Em = null);
      }
    }
    requestUpdate(t, e, i) {
      if (void 0 !== t) {
        if (
          ((i ??= this.constructor.getPropertyOptions(t)),
          !(null == i ? void 0 : i.hasChanged) || (i.hasChanged ?? m)(this[t], e))
        )
          this.P(t, e, i);
        else return;
      }
      !1 === this.isUpdatePending && (this._$ES = this._$ET());
    }
    P(t, e, i) {
      this._$AL.has(t) || this._$AL.set(t, e),
        !0 === (null == i ? void 0 : i.reflect) &&
          this._$Em !== t &&
          (this._$Ej ??= new Set()).add(t);
    }
    async _$ET() {
      this.isUpdatePending = !0;
      try {
        await this._$ES;
      } catch (t) {
        Promise.reject(t);
      }
      const t = this.scheduleUpdate();
      return null != t && (await t), !this.isUpdatePending;
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      var t;
      if (!this.isUpdatePending) return;
      if (!this.hasUpdated) {
        if (
          (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()),
          this._$Ep)
        ) {
          for (const [t, e] of this._$Ep) this[t] = e;
          this._$Ep = void 0;
        }
        const e = this.constructor.elementProperties;
        if (e.size > 0)
          for (const [t, i] of e)
            !0 !== i.wrapped ||
              this._$AL.has(t) ||
              void 0 === this[t] ||
              this.P(t, this[t], i);
      }
      let e = !1;
      const i = this._$AL;
      try {
        (e = this.shouldUpdate(i)),
          e
            ? (this.willUpdate(i),
              null === (t = this._$EO) ||
                void 0 === t ||
                t.forEach((t) => {
                  var e;
                  return null === (e = t.hostUpdate) || void 0 === e
                    ? void 0
                    : e.call(t);
                }),
              this.update(i))
            : this._$EU();
      } catch (t) {
        throw ((e = !1), this._$EU(), t);
      }
      e && this._$AE(i);
    }
    willUpdate(t) {}
    _$AE(t) {
      var e;
      null === (e = this._$EO) ||
        void 0 === e ||
        e.forEach((t) => {
          var e;
          return null === (e = t.hostUpdated) || void 0 === e
            ? void 0
            : e.call(t);
        }),
        this.hasUpdated || ((this.hasUpdated = !0), this.firstUpdated(t)),
        this.updated(t);
    }
    _$EU() {
      (this._$AL = new Map()), (this.isUpdatePending = !1);
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$ES;
    }
    shouldUpdate(t) {
      return !0;
    }
    update(t) {
      this._$Ej &&
        (this._$Ej = this._$Ej.forEach((t) => this._$EC(t, this[t]))),
        this._$EU();
    }
    updated(t) {}
    firstUpdated(t) {}
  }
  (v.elementStyles = []),
    (v.shadowRootOptions = { mode: "open" }),
    (v[g("elementProperties")] = new Map()),
    (v[g("finalized")] = new Map()),
    null == p || p({ ReactiveElement: v }),
    (null !== (l = d.reactiveElementVersions) && void 0 !== l
      ? l
      : (d.reactiveElementVersions = [])
    ).push("2.0.4");
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ var w;
  const b = globalThis,
    x = b.trustedTypes,
    y = x ? x.createPolicy("lit-html", { createHTML: (t) => t }) : void 0,
    A = "$lit$",
    M = `lit$${(Math.random() + "").slice(9)}$`,
    E = "?" + M,
    k = `<${E}>`,
    P = document,
    I = () => P.createComment(""),
    S = (t) => null === t || ("object" != typeof t && "function" != typeof t),
    B = Array.isArray,
    C = "[ \t\n\f\r]",
    T = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
    R = /-->/g,
    Q = />/g,
    U = RegExp(
      `>|${C}(?:([^\\s"'>=/]+)(${C}*=${C}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,
      "g"
    ),
    H = /'/g,
    O = /"/g,
    N = /^(?:script|style|textarea|title)$/i,
    J = ((t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }))(1),
    Y = Symbol.for("lit-noChange"),
    L = Symbol.for("lit-nothing"),
    D = new WeakMap(),
    F = P.createTreeWalker(P, 129);
  function X(t, e) {
    if (!B(t) || !t.hasOwnProperty("raw"))
      throw Error("invalid template strings array");
    return void 0 !== y ? y.createHTML(e) : e;
  }
  const q = (t, e) => {
    const i = t.length - 1,
      s = [];
    let o,
      r = 2 === e ? "<svg>" : 3 === e ? "<math>" : "",
      a = T;
    for (let e = 0; e < i; e++) {
      const i = t[e];
      let n,
        l,
        d = -1,
        h = 0;
      for (
        ;
        h < i.length && ((a.lastIndex = h), (l = a.exec(i)), null !== l);

      )
        (h = a.lastIndex),
          a === T
            ? "!--" === l[1]
              ? (a = R)
              : void 0 !== l[1]
              ? (a = Q)
              : void 0 !== l[2]
              ? (N.test(l[2]) && (o = RegExp("</" + l[2], "g")), (a = U))
              : void 0 !== l[3] && (a = U)
            : a === U
            ? ">" === l[0]
              ? ((a = o ?? T), (d = -1))
              : void 0 === l[1]
              ? (d = -2)
              : ((d = a.lastIndex - l[2].length),
                (n = l[1]),
                (a = void 0 === l[3] ? U : '"' === l[3] ? O : H))
            : a === O || a === H
            ? (a = U)
            : a === R || a === Q
            ? (a = T)
            : ((a = U), (o = void 0));
      const c = a === U && t[e + 1].startsWith("/>") ? " " : "";
      r +=
        a === T
          ? i + k
          : d >= 0
          ? (s.push(n), i.slice(0, d) + A + i.slice(d) + M + c)
          : i + M + (-2 === d ? e : c);
    }
    return [X(t, r + (t[i] || "<?>") + (2 === e ? "</svg>" : 3 === e ? "</math>" : "")), s];
  };
  class j {
    constructor({ strings: t, _$litType$: e }, i) {
      let s;
      this.parts = [];
      let o = 0,
        r = 0;
      const a = t.length - 1,
        n = this.parts,
        [l, d] = q(t, e);
      if (
        ((this.el = j.createElement(l, i)),
        (F.currentNode = this.el.content),
        2 === e || 3 === e)
      ) {
        const t = this.el.content.firstChild;
        t.replaceWith(...t.childNodes);
      }
      for (; null !== (s = F.nextNode()) && n.length < a; ) {
        if (1 === s.nodeType) {
          if (s.hasAttributes())
            for (const t of s.getAttributeNames())
              if (t.endsWith(A)) {
                const e = d[r++],
                  i = s.getAttribute(t).split(M),
                  a = /([.?@])?(.*)/.exec(e);
                n.push({
                  type: 1,
                  index: o,
                  name: a[2],
                  strings: i,
                  ctor: "." === a[1] ? W : "?" === a[1] ? Z : "@" === a[1] ? G : _,
                }),
                  s.removeAttribute(t);
              } else
                t.startsWith(M) &&
                  (n.push({ type: 6, index: o }), s.removeAttribute(t));
          if (N.test(s.tagName)) {
            const t = s.textContent.split(M),
              e = t.length - 1;
            if (e > 0) {
              s.textContent = x ? x.emptyScript : "";
              for (let i = 0; i < e; i++)
                s.append(t[i], I()), F.nextNode(), n.push({ type: 2, index: ++o });
              s.append(t[e], I());
            }
          }
        } else if (8 === s.nodeType)
          if (s.data === E) n.push({ type: 2, index: o });
          else {
            let t = -1;
            for (; -1 !== (t = s.data.indexOf(M, t + 1)); )
              n.push({ type: 7, index: o }), (t += M.length - 1);
          }
        o++;
      }
    }
    static createElement(t, e) {
      const i = P.createElement("template");
      return (i.innerHTML = t), i;
    }
  }
  function z(t, e, i = t, s) {
    var o, r;
    if (e === Y) return e;
    let a =
      void 0 !== s
        ? null === (o = i._$Co) || void 0 === o
          ? void 0
          : o[s]
        : i._$Cl;
    const n = S(e) ? void 0 : e._$litDirective$;
    return (
      (null == a ? void 0 : a.constructor) !== n &&
        (null === (r = null == a ? void 0 : a._$AO) ||
          void 0 === r ||
          r.call(a, !1),
        void 0 === n
          ? (a = void 0)
          : ((a = new n(t)), a._$AT(t, i, s)),
        void 0 !== s
          ? ((i._$Co ??= [])[s] = a)
          : (i._$Cl = a)),
      void 0 !== a && (e = z(t, a._$AS(t, e.values), a, s)),
      e
    );
  }
  class V {
    constructor(t, e) {
      (this._$AV = []),
        (this._$AN = void 0),
        (this._$AD = t),
        (this._$AM = e);
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t) {
      var e;
      const {
          el: { content: i },
          parts: s,
        } = this._$AD,
        o = (
          (null !== (e = null == t ? void 0 : t.creationScope) && void 0 !== e
            ? e
            : P
          ).importNode(i, !0)
        );
      F.currentNode = o;
      let r = F.nextNode(),
        a = 0,
        n = 0,
        l = s[0];
      for (; void 0 !== l; ) {
        if (a === l.index) {
          let e;
          2 === l.type
            ? (e = new K(r, r.nextSibling, this, t))
            : 1 === l.type
            ? (e = new l.ctor(r, l.name, l.strings, this, t))
            : 6 === l.type && (e = new tt(r, this, t)),
            this._$AV.push(e),
            (l = s[++n]);
        }
        a !== (null == l ? void 0 : l.index) && ((r = F.nextNode()), a++);
      }
      return (F.currentNode = P), o;
    }
    p(t) {
      let e = 0;
      for (const i of this._$AV)
        void 0 !== i &&
          (void 0 !== i.strings
            ? (i._$AI(t, i, e), (e += i.strings.length - 2))
            : i._$AI(t[e])),
          e++;
    }
  }
  class K {
    constructor(t, e, i, s) {
      var o;
      (this.type = 2),
        (this._$AH = L),
        (this._$AN = void 0),
        (this._$AA = t),
        (this._$AB = e),
        (this._$AM = i),
        (this.options = s),
        (this._$Cv =
          null === (o = null == s ? void 0 : s.isConnected) ||
          void 0 === o ||
          o);
    }
    get parentNode() {
      let t = this._$AA.parentNode;
      const e = this._$AM;
      return (
        void 0 !== e &&
          11 === (null == t ? void 0 : t.nodeType) &&
          (t = e.parentNode),
        t
      );
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t, e = this) {
      (t = z(this, t, e)),
        S(t)
          ? t === L || null == t || "" === t
            ? (this._$AH !== L && this._$AR(), (this._$AH = L))
            : t !== this._$AH && t !== Y && this._(t)
          : void 0 !== t._$litType$
          ? this.$(t)
          : void 0 !== t.nodeType
          ? this.T(t)
          : ((t) =>
              B(t) || "function" == typeof (null == t ? void 0 : t[Symbol.iterator]))(
              t
            )
          ? this.k(t)
          : this._(t);
    }
    O(t) {
      return this._$AA.parentNode.insertBefore(t, this._$AB);
    }
    T(t) {
      this._$AH !== t && (this._$AR(), (this._$AH = this.O(t)));
    }
    _(t) {
      this._$AH !== L && S(this._$AH)
        ? (this._$AA.nextSibling.data = t)
        : this.T(P.createTextNode(t)),
        (this._$AH = t);
    }
    $(t) {
      var e;
      const { values: i, _$litType$: s } = t,
        o =
          "number" == typeof s
            ? this._$AC(t)
            : (void 0 === s.el &&
                (s.el = j.createElement(
                  X(s.h, s.h[0]),
                  this.options
                )),
              s);
      if (
        (null === (e = this._$AH) || void 0 === e ? void 0 : e._$AD) === o
      )
        this._$AH.p(i);
      else {
        const t = new V(o, this),
          e = t.u(this.options);
        t.p(i), this.T(e), (this._$AH = t);
      }
    }
    _$AC(t) {
      let e = D.get(t.strings);
      return void 0 === e && D.set(t.strings, (e = new j(t))), e;
    }
    k(t) {
      B(this._$AH) || ((this._$AH = []), this._$AR());
      const e = this._$AH;
      let i,
        s = 0;
      for (const o of t)
        s === e.length
          ? e.push((i = new K(this.O(I()), this.O(I()), this, this.options)))
          : (i = e[s]),
          i._$AI(o),
          s++;
      s < e.length &&
        (this._$AR(null == i ? void 0 : i._$AB.nextSibling, s), (e.length = s));
    }
    _$AR(t = this._$AA.nextSibling, e) {
      var i;
      for (
        null === (i = this._$AP) || void 0 === i || i.call(this, !1, !0, e);
        t && t !== this._$AB;

      ) {
        const e = t.nextSibling;
        t.remove(), (t = e);
      }
    }
    setConnected(t) {
      var e;
      void 0 === this._$AM &&
        ((this._$Cv = t),
        null === (e = this._$AP) || void 0 === e || e.call(this, t));
    }
  }
  class _ {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t, e, i, s, o) {
      (this.type = 1),
        (this._$AH = L),
        (this._$AN = void 0),
        (this.element = t),
        (this.name = e),
        (this._$AM = s),
        (this.options = o),
        i.length > 2 || "" !== i[0] || "" !== i[1]
          ? ((this._$AH = Array(i.length - 1).fill(new String())),
            (this.strings = i))
          : (this._$AH = L);
    }
    _$AI(t, e = this, i, s) {
      const o = this.strings;
      let r = !1;
      if (void 0 === o)
        (t = z(this, t, e, 0)),
          (r = !S(t) || (t !== this._$AH && t !== Y)),
          r && (this._$AH = t);
      else {
        const s = t;
        let a, n;
        for (t = o[0], a = 0; a < o.length - 1; a++)
          (n = z(this, s[i + a], e, a)),
            n === Y && (n = this._$AH[a]),
            (r ||= !S(n) || n !== this._$AH[a]),
            n === L ? (t = L) : t !== L && (t += (n ?? "") + o[a + 1]),
            (this._$AH[a] = n);
      }
      r && !s && this.j(t);
    }
    j(t) {
      t === L
        ? this.element.removeAttribute(this.name)
        : this.element.setAttribute(this.name, t ?? "");
    }
  }
  class W extends _ {
    constructor() {
      super(...arguments), (this.type = 3);
    }
    j(t) {
      this.element[this.name] = t === L ? void 0 : t;
    }
  }
  class Z extends _ {
    constructor() {
      super(...arguments), (this.type = 4);
    }
    j(t) {
      this.element.toggleAttribute(this.name, !!t && t !== L);
    }
  }
  class G extends _ {
    constructor(t, e, i, s, o) {
      super(t, e, i, s, o), (this.type = 5);
    }
    _$AI(t, e = this) {
      if ((t = z(this, t, e, 0) ?? L) === Y) return;
      const i = this._$AH,
        s =
          (t === L && i !== L) ||
          t.capture !== i.capture ||
          t.once !== i.once ||
          t.passive !== i.passive,
        o = t !== L && (i === L || s);
      s && this.element.removeEventListener(this.name, this, i),
        o && this.element.addEventListener(this.name, this, t),
        (this._$AH = t);
    }
    handleEvent(t) {
      var e;
      "function" == typeof this._$AH
        ? this._$AH.call(
            (null === (e = this.options) || void 0 === e ? void 0 : e.host) ??
              this.element,
            t
          )
        : this._$AH.handleEvent(t);
    }
  }
  class tt {
    constructor(t, e, i) {
      (this.element = t),
        (this.type = 6),
        (this._$AN = void 0),
        (this._$AM = e),
        (this.options = i);
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t) {
      z(this, t);
    }
  }
  const et = b.litHtmlPolyfillSupport;
  null == et || et(j, K),
    (null !== (w = b.litHtmlVersions) && void 0 !== w
      ? w
      : (b.litHtmlVersions = [])
    ).push("3.1.2");
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ var it, st;
  class ot extends v {
    constructor() {
      super(...arguments),
        (this.renderOptions = { host: this }),
        (this._$Do = void 0);
    }
    createRenderRoot() {
      var t, e;
      const i = super.createRenderRoot();
      return (
        (null !== (t = (e = this.renderOptions).renderBefore) && void 0 !== t) ||
          (e.renderBefore = i.firstChild),
        i
      );
    }
    update(t) {
      const e = this.render();
      this.hasUpdated ||
        (this.renderOptions.isConnected = this.isConnected),
        super.update(t),
        (this._$Do = ((t, e, i) => {
          var s, o;
          const r =
              null !== (s = null == i ? void 0 : i.renderBefore) && void 0 !== s
                ? s
                : e;
          let a = r._$litPart$;
          if (void 0 === a) {
            const t =
              null !== (o = null == i ? void 0 : i.renderBefore) && void 0 !== o
                ? o
                : null;
            r._$litPart$ = a = new K(
              e.insertBefore(I(), t),
              t,
              void 0,
              i ?? {}
            );
          }
          return a._$AI(t), a;
        })(e, this.renderRoot, this.renderOptions));
    }
    connectedCallback() {
      var t;
      super.connectedCallback(),
        null === (t = this._$Do) || void 0 === t || t.setConnected(!0);
    }
    disconnectedCallback() {
      var t;
      super.disconnectedCallback(),
        null === (t = this._$Do) || void 0 === t || t.setConnected(!1);
    }
    render() {
      return Y;
    }
  }
  (ot.finalized = !0),
    (ot._$litElement$ = !0),
    null === (it = globalThis.litElementHydrateSupport) ||
      void 0 === it ||
      it.call(globalThis, { LitElement: ot });
  const rt = globalThis.litElementPolyfillSupport;
  null == rt || rt({ LitElement: ot });
  (null !== (st = globalThis.litElementVersions) && void 0 !== st
    ? st
    : (globalThis.litElementVersions = [])
  ).push("4.0.4");
  
  const API_ENDPOINT = "https://reviews-widgetchris.netlify.app/api/widgets";

  class ReviewWidget extends ot {
    static styles = r`
        :host {
          --w-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          --w-background: 240 10% 3.9%;
          --w-foreground: 0 0% 98%;
          --w-card: 240 4.8% 9.8%;
          --w-card-foreground: 0 0% 98%;
          --w-primary: 262.1 83.3% 57.8%;
          --w-primary-foreground: 0 0% 98%;
          --w-secondary: 240 3.7% 15.9%;
          --w-muted: 240 3.7% 15.9%;
          --w-muted-foreground: 240 5% 64.9%;
          --w-accent: 333.3 83.3% 57.8%;
          --w-accent-foreground: 0 0% 98%;
          --w-border: 240 3.7% 15.9%;
          --w-input: 240 5.9% 90%;
          --w-ring: 231 48% 48%;
          --w-radius: 0.8rem;
          display: block;
          box-sizing: border-box;
        }
        *, *::before, *::after { box-sizing: inherit; }

        .p-4 { padding: 1rem; }
        .sm\\:p-6 { padding: 1.5rem; }
        .bg-background { background-color: hsl(var(--w-background)); }
        .text-foreground { color: hsl(var(--w-foreground)); }
        .min-h-screen { min-height: 100vh; }
        .font-body { font-family: var(--w-font-family); }
        .max-w-4xl { max-width: 56rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-6 { margin-bottom: 1.5rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .font-bold { font-weight: 700; }
        .text-primary { color: hsl(var(--w-primary)); }
        .hover\\:underline:hover { text-decoration-line: underline; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) { .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        .gap-6 { gap: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .card { border-radius: var(--w-radius); border: 1px solid hsl(var(--w-border)); background-color: hsl(var(--w-card)); color: hsl(var(--w-card-foreground)); box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06); }
        .md\\:col-span-1 { grid-column: span 1 / span 1; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .p-6 { padding: 1.5rem; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-muted-foreground { color: hsl(var(--w-muted-foreground)); }
        .mt-2 { margin-top: 0.5rem; }
        @media (min-width: 768px) { .md\\:col-span-2 { grid-column: span 2 / span 2; } }
        .font-semibold { font-weight: 600; }
        .mb-3 { margin-bottom: 0.75rem; }
        .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
        .gap-2 { gap: 0.5rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .w-6 { width: 1.5rem; }
        .text-right { text-align: right; }
        .h-4 { height: 1rem; }
        .w-4 { width: 1rem; }
        .text-accent { color: hsl(var(--w-accent)); }
        .progress { position: relative; height: 0.5rem; width: 100%; overflow: hidden; border-radius: 9999px; background-color: hsl(var(--w-secondary)); }
        .progress-indicator { height: 100%; width: 100%; flex: 1 1 0%; background-color: hsl(var(--w-primary)); transition: all .2s ease-in-out; }
        .w-full { width: 100%; }
        .h-2 { height: 0.5rem; }
        .w-8 { width: 2rem; }
        .mb-4 { margin-bottom: 1rem; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .justify-between { justify-content: space-between; }
        .button { display: inline-flex; align-items: center; justify-content: center; border-radius: calc(var(--w-radius) - 2px); font-size: 0.875rem; font-weight: 500; height: 2.5rem; padding-left: 1rem; padding-right: 1rem; background-color: hsl(var(--w-primary)); color: hsl(var(--w-primary-foreground)); cursor: pointer; border: none; transition: background-color .2s; }
        .button:hover { background-color: hsl(var(--w-primary)/0.9); }
        .button:disabled { opacity: 0.5; cursor: not-allowed; }
        
        /* Tabs */
        .tabs-list { display: inline-flex; height: 2.5rem; align-items: center; justify-content: center; border-radius: var(--w-radius); background-color: hsl(var(--w-muted)); padding: 0.25rem; color: hsl(var(--w-muted-foreground));}
        .tabs-trigger { display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; border-radius: calc(var(--w-radius) - 4px); padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; background: transparent; color: inherit; transition: all .2s ease-in-out;}
        .tabs-trigger[data-state="active"] { background-color: hsl(var(--w-background)); color: hsl(var(--w-foreground)); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
        .tabs-content { margin-top: 1rem; }

        /* Carousel */
        .carousel { position: relative; width: 100%; overflow: hidden; }
        .carousel-content { display: flex; transition: transform 0.3s ease; }
        .carousel-item { min-width: 0; flex-shrink: 0; flex-grow: 0; width: 100%; }
        @media (min-width: 768px) { .carousel-item { width: 50%; } }
        @media (min-width: 1024px) { .carousel-item { width: 33.333333%; } }
        .p-1 { padding: 0.25rem; }
        .h-full { height: 100%; }
        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .avatar { position: relative; display: flex; height: 2.5rem; width: 2.5rem; flex-shrink: 0; overflow: hidden; border-radius: 9999px; }
        .avatar-img { aspect-ratio: 1/1; height: 100%; width: 100%; }
        .avatar-fallback { display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; border-radius: 9999px; background-color: hsl(var(--w-muted)); }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-foreground\\/80 { color: hsla(var(--w-foreground)/0.8); }
        .pt-2 { padding-top: 0.5rem; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }
        .carousel-prev, .carousel-next { position: absolute; top: 50%; transform: translateY(-50%); height: 2rem; width: 2rem; border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center; background-color:hsl(var(--w-card)); border: 1px solid hsl(var(--w-border)); color:hsl(var(--w-foreground)); cursor:pointer; z-index: 10; }
        .carousel-prev:hover, .carousel-next:hover { background-color:hsl(var(--w-accent)); color:hsl(var(--w-accent-foreground));}
        .carousel-prev { left: 0.5rem; }
        .carousel-next { right: 0.5rem; }
        
        .border-2 { border-width: 2px; }
        .border-dashed { border-style: dashed; }
        .rounded-lg { border-radius: var(--w-radius); }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .h-12 { height: 3rem; }
        .w-12 { width: 3rem; }
        .mt-12 { margin-top: 3rem; }
        .star-rating { display: flex; align-items: center; gap: 0.125rem; }
        .star { height: 1.25rem; width: 1.25rem; }
        .star-filled { color: hsl(var(--w-accent)); fill: hsl(var(--w-accent)); }
        .star-empty { color: hsla(var(--w-muted-foreground)/0.3); }

        /* Dialog */
        .dialog-overlay { position: fixed; inset: 0; z-index: 50; background-color: hsla(0, 0%, 0%, 0.8); backdrop-filter: blur(4px); display:flex; align-items:center; justify-content:center; }
        .dialog-content { z-index: 50; width: 100%; max-width: 26.5rem; gap: 1rem; border: 1px solid hsl(var(--w-border)); background-color: hsl(var(--w-card)); padding: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); border-radius: var(--w-radius); position:relative; }
        .dialog-header { display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
        .dialog-title { font-size: 1.25rem; font-weight: 600; }
        .dialog-description { font-size: 0.875rem; color: hsl(var(--w-muted-foreground)); }
        .form { display: flex; flex-direction: column; gap: 1rem; padding-top:1rem; padding-bottom:1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-label { font-size: 0.875rem; font-weight: 500; }
        .form-input, .form-textarea { display: flex; width: 100%; border-radius: calc(var(--w-radius) - 4px); border: 1px solid hsl(var(--w-border)); background-color: hsl(var(--w-muted)); color: hsl(var(--w-foreground)); padding: 0.5rem 0.75rem; font-size:0.875rem; box-sizing: border-box; }
        .form-input:focus, .form-textarea:focus { outline:none; border-color: hsl(var(--w-primary)); box-shadow: 0 0 0 2px hsl(var(--w-ring)); }
        .form-textarea { min-height: 80px; }
        .rating-stars { display: flex; align-items: center; gap: 0.25rem; }
        .star-btn { cursor: pointer; transition: color 0.2s ease-in-out; background: none; border: none; padding: 0; color: hsla(var(--w-muted-foreground)/0.3); }
        .star-btn.hover, .star-btn.active { color: hsl(var(--w-accent)); }
        .star-btn svg { width: 1.5rem; height: 1.5rem; }
        .justify-end { justify-content: flex-end; }
        .dialog-close { position: absolute; right: 1rem; top: 1rem; border-radius: calc(var(--w-radius) - 4px); opacity: 0.7; cursor: pointer; background:none; border:none; color: hsl(var(--w-foreground)); font-size: 1.5rem; line-height: 1; padding:0; }
        .dialog-close:hover { opacity: 1; }
      `;

    static properties = {
      widgetId: { type: String, reflect: true },
      widget: { type: Object, state: true },
      loading: { type: Boolean, state: true },
      error: { type: String, state: true },
      showForm: { type: Boolean, state: true },
      activeTab: { type: String, state: true },
    };

    constructor() {
      super();
      this.widgetId = '';
      this.widget = null;
      this.loading = true;
      this.error = null;
      this.showForm = false;
      this.activeTab = 'all';
    }

    connectedCallback() {
      super.connectedCallback();
      if (this.widgetId) {
        this.fetchReviews();
      } else if (this.getAttribute('widgetId')) {
          this.widgetId = this.getAttribute('widgetId');
          this.fetchReviews();
      }
    }
    
    async fetchReviews() {
        if (!this.widgetId) {
            this.error = "Widget ID is missing.";
            this.loading = false;
            return;
        }
        this.loading = true;
        try {
            const response = await fetch(`${API_ENDPOINT}/${this.widgetId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch widget data.");
            }
            const data = await response.json();
            this.widget = data.data;
        } catch (error) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }

    get processedReviews() {
        if (!this.widget?.reviews || this.widget.reviews.length === 0) {
            return {
              overallRating: 0,
              totalReviews: 0,
              ratingDistribution: [0, 0, 0, 0, 0],
              reviewsBySource: {},
              sources: [],
              allReviewsSorted: []
            };
        }
    
        const total = this.widget.reviews.reduce((acc, review) => acc + review.stars, 0);
        const overall = total / this.widget.reviews.length;
    
        const distribution = [0, 0, 0, 0, 0];
        const sourceCounts = {};
    
        const sortedReviews = [...this.widget.reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
        for (const review of sortedReviews) {
          distribution[5 - review.stars]++;
          if (!sourceCounts[review.source]) {
            sourceCounts[review.source] = [];
          }
          sourceCounts[review.source].push(review);
        }
    
        return {
          overallRating: overall,
          totalReviews: this.widget.reviews.length,
          ratingDistribution: distribution,
          reviewsBySource: sourceCounts,
          sources: Object.keys(sourceCounts).sort(),
          allReviewsSorted: sortedReviews,
        };
    }

    renderStarRating(rating) {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(J`
                <svg class="star ${i < Math.round(rating) ? 'star-filled' : 'star-empty'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            `);
        }
        return J`<div class="star-rating">${stars}</div>`;
    }

    renderCarousel(reviews) {
        if (!reviews || reviews.length === 0) return '';
        return J`
            <div class="carousel">
                <div class="carousel-content">
                    ${reviews.map(review => J`
                        <div class="carousel-item">
                            <div class="p-1 h-full">
                                <div class="card flex flex-col h-full bg-card">
                                    <div class="p-6 flex-1 space-y-4">
                                        <div class="flex items-center gap-3">
                                            <div class="avatar">
                                                <span class="avatar-fallback">${review.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p class="font-semibold">${review.name}</p>
                                                <p class="text-xs text-muted-foreground">${review.source} review</p>
                                            </div>
                                        </div>
                                        ${this.renderStarRating(review.stars)}
                                        <p class="text-sm text-foreground/80 pt-2">${review.text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }
    
    handleAddReviewSuccess() {
        this.showForm = false;
        this.fetchReviews();
    }

    render() {
      if (this.loading) return J`<div class="p-4 text-center">Loading...</div>`;
      if (this.error) return J`<div class="p-4 text-center text-red-500">Error: ${this.error}</div>`;
      if (!this.widget) return null;

      const { overallRating, totalReviews, ratingDistribution, reviewsBySource, sources, allReviewsSorted } = this.processedReviews;

      return J`
        <div class="p-4 sm:p-6 bg-background text-foreground min-h-screen font-body">
          <div class="max-w-4xl mx-auto">
            <header class="mb-6">
              <h1 class="text-3xl font-bold">${this.widget.businessName}</h1>
              <a href=${this.widget.website} target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                ${this.widget.website}
              </a>
            </header>

            ${totalReviews > 0 ? J`
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="card md:col-span-1 flex flex-col items-center justify-center text-center p-6 bg-card">
                  <p class="text-5xl font-bold">${overallRating.toFixed(1)}</p>
                  ${this.renderStarRating(overallRating)}
                  <p class="text-muted-foreground mt-2">Based on ${totalReviews} reviews</p>
                </div>
                <div class="card md:col-span-2 p-6 bg-card">
                  <h2 class="font-semibold mb-3">Rating distribution</h2>
                  <div class="space-y-2">
                    ${ratingDistribution.map((count, i) => J`
                      <div class="flex items-center gap-2 text-sm">
                        <span class="text-muted-foreground w-6 text-right">${5 - i}</span>
                        <svg class="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        <div class="progress w-full h-2">
                            <div class="progress-indicator" style="transform: translateX(-${100 - (count / totalReviews) * 100}%)"></div>
                        </div>
                        <span class="text-muted-foreground w-8 text-right">${count}</span>
                      </div>
                    `)}
                  </div>
                </div>
              </div>` : ''}

              <div>
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-bold">${totalReviews > 0 ? "What people are saying" : "Be the first to leave a review"}</h2>
                  <button @click=${() => this.showForm = true} class="button">Write a Review</button>
                </div>

                ${this.showForm ? J`
                    <div class="dialog-overlay" @click=${() => this.showForm = false}>
                        <div class="dialog-content" @click=${e => e.stopPropagation()}>
                            <div class="dialog-header">
                                <h3 class="dialog-title">Write a review</h3>
                                <p class="dialog-description">Share your experience with ${this.widget.businessName}.</p>
                                <button class="dialog-close" @click=${() => this.showForm = false}>&times;</button>
                            </div>
                            <add-review-form .widgetId=${this.widgetId} @form-success=${() => this.handleAddReviewSuccess()}></add-review-form>
                        </div>
                    </div>` : ''}
                
                ${totalReviews > 0 ? J`
                    <div class="tabs">
                        <div class="tabs-list">
                            <button 
                                class="tabs-trigger" 
                                data-state=${this.activeTab === 'all' ? 'active' : 'inactive'}
                                @click=${() => this.activeTab = 'all'}>
                                All
                            </button>
                            ${sources.map(source => J`
                                <button 
                                    class="tabs-trigger" 
                                    data-state=${this.activeTab === source ? 'active' : 'inactive'}
                                    @click=${() => this.activeTab = source}>
                                    ${source}
                                </button>
                            `)}
                        </div>
                        <div class="tabs-content">
                            ${this.activeTab === 'all' ? this.renderCarousel(allReviewsSorted) : ''}
                            ${sources.map(source => 
                                this.activeTab === source ? this.renderCarousel(reviewsBySource[source]) : ''
                            )}
                        </div>
                    </div>
                ` : J`
                  <div class="text-center py-20 border-2 border-dashed rounded-lg bg-card text-muted-foreground">
                    <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <h3 class="mt-2 text-xl font-semibold">No reviews yet</h3>
                    <p>Your widget is ready to collect feedback.</p>
                  </div>`}
              </div>

              <footer class="text-center mt-12">
                <p class="text-sm text-muted-foreground">Powered by Widget Wizard</p>
              </footer>
          </div>
        </div>
      `;
    }
  }

  class AddReviewForm extends ot {
    static properties = {
        widgetId: { type: String },
        rating: { type: Number, state: true },
        hoverRating: { type: Number, state: true },
        submitting: { type: Boolean, state: true },
    };

    constructor() {
        super();
        this.widgetId = '';
        this.rating = 0;
        this.hoverRating = 0;
        this.submitting = false;
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.submitting = true;
        const formData = new FormData(e.target);
        const reviewData = {
            name: formData.get('name'),
            stars: this.rating,
            text: formData.get('text'),
            source: 'Direct',
        };

        if (this.rating === 0) {
            alert('Please select a star rating.');
            this.submitting = false;
            return;
        }

        try {
            const response = await fetch(`${API_ENDPOINT}/${this.widgetId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });
            if (!response.ok) throw new Error('Submission failed');
            this.dispatchEvent(new CustomEvent('form-success', { bubbles: true, composed: true }));
        } catch (error) {
            console.error(error);
            alert('Failed to submit review. Please try again.');
        } finally {
            this.submitting = false;
        }
    }
    
    render() {
        return J`
            <form @submit=${this.handleSubmit} class="form">
                <div class="form-group">
                    <label for="name" class="form-label">Your Name</label>
                    <input id="name" name="name" required class="form-input" />
                </div>
                <div class="form-group">
                    <label class="form-label">Rating</label>
                    <div class="rating-stars">
                        ${[1, 2, 3, 4, 5].map(star => J`
                            <button 
                                type="button" 
                                @click=${() => this.rating = star} 
                                @mouseenter=${() => this.hoverRating = star}
                                @mouseleave=${() => this.hoverRating = 0}
                                class="star-btn ${this.hoverRating >= star || this.rating >= star ? 'active' : ''}">
                                <svg fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                            </button>
                        `)}
                    </div>
                </div>
                <div class="form-group">
                    <label for="text" class="form-label">Review</label>
                    <textarea id="text" name="text" required class="form-textarea"></textarea>
                </div>
                <div class="flex justify-end">
                    <button type="submit" class="button" ?disabled=${this.submitting}>
                        ${this.submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        `;
    }
  }

  customElements.define("review-widget", ReviewWidget);
  customElements.define("add-review-form", AddReviewForm);

})();
