/**
 * Diubah dari CommonJS menjadi ESModules (import/export)
 */
"use strict";

// Ubah semua require() menjadi import
import AtRule from "./at-rule";
import Comment from "./comment";
import Container from "./container";
import CssSyntaxError from "./css-syntax-error";
import Declaration from "./declaration";
import Document from "./document";
import fromJSON from "./fromJSON";
import Input from "./input";
import LazyResult from "./lazy-result";
import list from "./list";
import Node from "./node";
import parse from "./parse";
import Processor from "./processor";
import Result from "./result.js";
import Root from "./root";
import Rule from "./rule";
import stringify from "./stringify";
import Warning from "./warning";

// Fungsi utama postcss
function postcss(...s) {
    if (s.length === 1 && Array.isArray(s[0])) {
        s = s[0];
    }
    return new Processor(s);
}

// postcss.plugin diubah menjadi esmodules
postcss.plugin = function(s, e) {
    let t, r = false;
    
    function o(...t) {
        if (console && console.warn && !r) {
            r = true;
            console.warn(s + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration");
            if (process.env.LANG && process.env.LANG.startsWith("cn")) {
                console.warn(s + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226");
            }
        }
        let o = e(...t);
        o.postcssPlugin = s;
        o.postcssVersion = (new Processor()).version;
        return o;
    }

    Object.defineProperty(o, "postcss", {
        get: () => (t || (t = o()), t)
    });
    
    o.process = function(s, e, t) {
        return postcss([o(t)]).process(s, e);
    };
    
    return o;
};

// Tambahkan fungsi-fungsi lain
postcss.stringify = stringify;
postcss.parse = parse;
postcss.fromJSON = fromJSON;
postcss.list = list;
postcss.comment = s => new Comment(s);
postcss.atRule = s => new AtRule(s);
postcss.decl = s => new Declaration(s);
postcss.rule = s => new Rule(s);
postcss.root = s => new Root(s);
postcss.document = s => new Document(s);

// Tambahkan class-class dari modul lain ke dalam postcss
postcss.CssSyntaxError = CssSyntaxError;
postcss.Declaration = Declaration;
postcss.Container = Container;
postcss.Processor = Processor;
postcss.Document = Document;
postcss.Comment = Comment;
postcss.Warning = Warning;
postcss.AtRule = AtRule;
postcss.Result = Result;
postcss.Input = Input;
postcss.Rule = Rule;
postcss.Root = Root;
postcss.Node = Node;

// Ubah module.exports menjadi export default
export default postcss;
