"use strict";(self.webpackChunksmartcloud=self.webpackChunksmartcloud||[]).push([[294],{5318:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return m}});var r=n(7378);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),l=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=l(e.components);return r.createElement(s.Provider,{value:t},e.children)},g={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),c=l(n),m=i,d=c["".concat(s,".").concat(m)]||c[m]||g[m]||a;return n?r.createElement(d,o(o({ref:t},u),{},{components:n})):r.createElement(d,o({ref:t},u))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=c;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p.mdxType="string"==typeof e?e:i,o[1]=p;for(var l=2;l<a;l++)o[l]=n[l];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},5410:function(e,t,n){n.r(t),n.d(t,{assets:function(){return u},contentTitle:function(){return s},default:function(){return m},frontMatter:function(){return p},metadata:function(){return l},toc:function(){return g}});var r=n(5773),i=n(808),a=(n(7378),n(5318)),o=["components"],p={title:"GPG Key Configuration",sidebar_label:"GPG Key Configuration",sidebar_position:4},s=void 0,l={unversionedId:"getting-started/contributing/gpgkey",id:"getting-started/contributing/gpgkey",title:"GPG Key Configuration",description:"This tutorial was originally writen by Stephen Rees-Carter",source:"@site/docs/getting-started/contributing/gpgkey.md",sourceDirName:"getting-started/contributing",slug:"/getting-started/contributing/gpgkey",permalink:"/smartcloud/docs/getting-started/contributing/gpgkey",draft:!1,editUrl:"https://github.com/resnovas/smartcloud/edit/develop/docs/docs/getting-started/contributing/gpgkey.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{title:"GPG Key Configuration",sidebar_label:"GPG Key Configuration",sidebar_position:4},sidebar:"getting",previous:{title:"Code Review Process",permalink:"/smartcloud/docs/getting-started/contributing/code-review-process"},next:{title:"Security Disclosures",permalink:"/smartcloud/docs/getting-started/contributing/security"}},u={},g=[{value:"Prerequisities",id:"prerequisities",level:2},{value:"Update the GPG Key",id:"update-the-gpg-key",level:2}],c={toc:g};function m(e){var t=e.components,n=(0,i.Z)(e,o);return(0,a.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"signing-git-with-gpg-using-keybase"},"Signing Git with GPG using Keybase"),(0,a.kt)("p",null,"This tutorial was originally writen by ",(0,a.kt)("a",{parentName:"p",href:"https://stephenreescarter.net/signing-git-commits-with-a-keybase-gpg-key/"},"Stephen Rees-Carter")),(0,a.kt)("p",null,"We suggest using this method of GPG key setup to reduce the amount of keys you need to maintain when working on your devices, however it's not perfect for everyone. This tutorial assumes that you are working from a private machine."),(0,a.kt)("h2",{id:"prerequisities"},"Prerequisities"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://keybase.io/inv/8353caa6be"},"Keybase")," installed"),(0,a.kt)("li",{parentName:"ul"},"GPG Key configured within Keybase"),(0,a.kt)("li",{parentName:"ul"},"GPG installed on your device (",(0,a.kt)("a",{parentName:"li",href:"https://www.gpg4win.org/"},"Windows")," | ",(0,a.kt)("a",{parentName:"li",href:"https://gnupg.org/download/"},"Linux")," | ",(0,a.kt)("a",{parentName:"li",href:"https://gpgtools.org/"},"macOS"),")")),(0,a.kt)("h2",{id:"update-the-gpg-key"},"Update the GPG Key"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"First, export your public and private keys from Keybase using the ",(0,a.kt)("inlineCode",{parentName:"p"},"keybase pgp")," command:"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"keybase pgp export --outfile keybase-public.key\nkeybase pgp export --secret --outfile keybase-private.key\n")),(0,a.kt)("p",{parentName:"li"},"During the export process, Keybase will ask for your account password and prompt to set a new password for the private key file.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Next, you need to import the keys into GPG using the ",(0,a.kt)("inlineCode",{parentName:"p"},"gpg")," command:"),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"gpg --allow-secret-key-import --import keybase-private.key\ngpg --import keybase-public.key\n")),(0,a.kt)("p",{parentName:"li"},"The import process will ask for the password you just assigned to your private key, for obvious reasons.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Now that you\u2019ve imported the key into GPG, you need to modify the key to include your email address. This is done by invoking the ",(0,a.kt)("inlineCode",{parentName:"p"},"gpg --edit-key")," command, with a unique identifier for your key. I found using the ",(0,a.kt)("inlineCode",{parentName:"p"},"<username>@keybase.io")," address worked nicely."),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"gpg --edit-key < username > @keybase.io\n")),(0,a.kt)("p",{parentName:"li"},"This command will get you into the ",(0,a.kt)("inlineCode",{parentName:"p"},"gpg>")," prompt, and from there you need to run the ",(0,a.kt)("inlineCode",{parentName:"p"},"adduid")," command. It will prompt for your ",(0,a.kt)("inlineCode",{parentName:"p"},"Real name")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"Email address")," (feel free to leave ",(0,a.kt)("inlineCode",{parentName:"p"},"Comment")," empty). Once you\u2019ve provided your name and email, confirm using the ",(0,a.kt)("inlineCode",{parentName:"p"},"O")," and then ",(0,a.kt)("inlineCode",{parentName:"p"},"save")," to close the ",(0,a.kt)("inlineCode",{parentName:"p"},"gpg>")," prompt.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Using ",(0,a.kt)("inlineCode",{parentName:"p"},"gpg --edit-key <key>")," and selecting the ",(0,a.kt)("inlineCode",{parentName:"p"},"trust")," option. I suggest using trust level ",(0,a.kt)("inlineCode",{parentName:"p"},"5 = I trust ultimately"),", since it is your own key. After applying the change, use ",(0,a.kt)("inlineCode",{parentName:"p"},"save")," to close the prompt.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Once that\u2019s done, you can push your updated key back into Keybase."),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"keybase pgp update\n"))),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Add key to ",(0,a.kt)("a",{parentName:"p",href:"https://github.com"},"Github")," (",(0,a.kt)("a",{parentName:"p",href:"https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/adding-a-new-gpg-key-to-your-github-account"},"follow this tutorial"),")")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Setup git signing on commits\nUse the ",(0,a.kt)("inlineCode",{parentName:"p"},"git config user.signingkey")," option to specify the Key ID for git to use. You can get this from the GitHub GPG keys page if you\u2019re unsure what it is. You can also require Git to sign all commits with the ",(0,a.kt)("inlineCode",{parentName:"p"},"commit.gpgsign")," option."),(0,a.kt)("pre",{parentName:"li"},(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"git config --global user.signingkey <Key ID>\ngit config --global commit.gpgsign true\n")))))}m.isMDXComponent=!0}}]);