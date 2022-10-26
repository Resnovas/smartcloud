"use strict";(self.webpackChunksmartcloud=self.webpackChunksmartcloud||[]).push([[329],{5318:function(e,n,t){t.d(n,{Zo:function(){return p},kt:function(){return g}});var r=t(7378);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var u=r.createContext({}),c=function(e){var n=r.useContext(u),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},p=function(e){var n=c(e.components);return r.createElement(u.Provider,{value:n},e.children)},s={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,u=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),d=c(t),g=i,m=d["".concat(u,".").concat(g)]||d[g]||s[g]||o;return t?r.createElement(m,l(l({ref:n},p),{},{components:t})):r.createElement(m,l({ref:n},p))}));function g(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,l=new Array(o);l[0]=d;var a={};for(var u in n)hasOwnProperty.call(n,u)&&(a[u]=n[u]);a.originalType=e,a.mdxType="string"==typeof e?e:i,l[1]=a;for(var c=2;c<o;c++)l[c]=t[c];return r.createElement.apply(null,l)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},50:function(e,n,t){t.r(n),t.d(n,{assets:function(){return p},contentTitle:function(){return u},default:function(){return g},frontMatter:function(){return a},metadata:function(){return c},toc:function(){return s}});var r=t(5773),i=t(808),o=(t(7378),t(5318)),l=["components"],a={title:"Running Locally",sidebar_label:"Running Locally",sidebar_position:1},u=void 0,c={unversionedId:"getting-started/contributing/runningLocally",id:"getting-started/contributing/runningLocally",title:"Running Locally",description:"Setting up local running is simple, however we MUST warn that building / packaging while using local scripts can cause your GITHUB_TOKEN to be included within the package. To avoid this happening. you MUST follow the steps correctly. We will not be held responsible for any leeked personal tokens.",source:"@site/docs/getting-started/contributing/runningLocally.md",sourceDirName:"getting-started/contributing",slug:"/getting-started/contributing/runningLocally",permalink:"/smartcloud/docs/getting-started/contributing/runningLocally",draft:!1,editUrl:"https://github.com/resnovas/smartcloud/edit/develop/docs/docs/getting-started/contributing/runningLocally.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Running Locally",sidebar_label:"Running Locally",sidebar_position:1},sidebar:"getting",previous:{title:"Using Regex",permalink:"/smartcloud/docs/getting-started/features/regex"},next:{title:"Code of Conduct",permalink:"/smartcloud/docs/getting-started/contributing/CODE_OF_CONDUCT"}},p={},s=[{value:"Prerequisities",id:"prerequisities",level:2},{value:"Developing",id:"developing",level:2},{value:"Running locally",id:"running-locally",level:2}],d={toc:s};function g(e){var n=e.components,t=(0,i.Z)(e,l);return(0,o.kt)("wrapper",(0,r.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"running-locally--developing"},"Running Locally & Developing"),(0,o.kt)("p",null,"Setting up local running is simple, however we ",(0,o.kt)("strong",{parentName:"p"},"MUST")," warn that building / packaging while using local scripts can cause your GITHUB_TOKEN to be included within the package. To avoid this happening. you ",(0,o.kt)("strong",{parentName:"p"},"MUST")," follow the steps correctly. We will not be held responsible for any leeked personal tokens."),(0,o.kt)("h2",{id:"prerequisities"},"Prerequisities"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"Setup a secret on your repository named: ",(0,o.kt)("inlineCode",{parentName:"li"},"ACTIONS_STEP_DEBUG")," value: ",(0,o.kt)("inlineCode",{parentName:"li"},"true")),(0,o.kt)("li",{parentName:"ol"},"Ensure the action has run once after you created this secret")),(0,o.kt)("h2",{id:"developing"},"Developing"),(0,o.kt)("ol",{start:3},(0,o.kt)("li",{parentName:"ol"},"Fork & Clone the ",(0,o.kt)("a",{parentName:"li",href:"https://github.com/Videndum/action-masterminds"},"development repository")),(0,o.kt)("li",{parentName:"ol"},"Continue from step 4 of ",(0,o.kt)("inlineCode",{parentName:"li"},"Running Locally")," then return to step 5 & 6."),(0,o.kt)("li",{parentName:"ol"},"Make changes, then rebuild using ",(0,o.kt)("inlineCode",{parentName:"li"},"npm run dev:run")," or ",(0,o.kt)("inlineCode",{parentName:"li"},"yarn dev:run")),(0,o.kt)("li",{parentName:"ol"},"If uploading changes to Github",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Delete ",(0,o.kt)("inlineCode",{parentName:"li"},"./context.json"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"./config"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"./lib"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"./dist"),"."),(0,o.kt)("li",{parentName:"ul"},"Run ",(0,o.kt)("inlineCode",{parentName:"li"},"yarn dev:all"),"."),(0,o.kt)("li",{parentName:"ul"},"Commit & push.")))),(0,o.kt)("h2",{id:"running-locally"},"Running locally"),(0,o.kt)("ol",{start:3},(0,o.kt)("li",{parentName:"ol"},"Fork & Clone this repository"),(0,o.kt)("li",{parentName:"ol"},"Run ",(0,o.kt)("inlineCode",{parentName:"li"},"yarn install")," or ",(0,o.kt)("inlineCode",{parentName:"li"},"npm install")),(0,o.kt)("li",{parentName:"ol"},"From the action logs find ",(0,o.kt)("inlineCode",{parentName:"li"},"Context for local running")," copy the output into a file named ",(0,o.kt)("inlineCode",{parentName:"li"},"./context.json")," at the root of the project."),(0,o.kt)("li",{parentName:"ol"},"Modify the ",(0,o.kt)("inlineCode",{parentName:"li"},"./config.sample.json")," to contain your ",(0,o.kt)("inlineCode",{parentName:"li"},"GITHUB_TOKEN")," and rename to ",(0,o.kt)("inlineCode",{parentName:"li"},"./config.json")),(0,o.kt)("li",{parentName:"ol"},"Run the script using ",(0,o.kt)("inlineCode",{parentName:"li"},"yarn dev:run")," or ",(0,o.kt)("inlineCode",{parentName:"li"},"npm run dev:run"))))}g.isMDXComponent=!0}}]);