import{r as e,i,x as a}from"./lit-element-4sfn79jP.js";var n={kind:"Document",definitions:[{kind:"OperationDefinition",operation:"query",name:{kind:"Name",value:"blockIndexFetchPages"},variableDefinitions:[{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"siteId"}},type:{kind:"NonNullType",type:{kind:"NamedType",name:{kind:"Name",value:"UUID"}}},directives:[]},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"locale"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"parentPath"}},type:{kind:"NamedType",name:{kind:"Name",value:"String"}},directives:[]},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"tags"}},type:{kind:"ListType",type:{kind:"NamedType",name:{kind:"Name",value:"String"}}},directives:[]},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"limit"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}},directives:[]},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderBy"}},type:{kind:"NamedType",name:{kind:"Name",value:"TreeOrderBy"}},directives:[]},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"orderByDirection"}},type:{kind:"NamedType",name:{kind:"Name",value:"OrderByDirection"}},directives:[]},{kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:"depth"}},type:{kind:"NamedType",name:{kind:"Name",value:"Int"}},directives:[]}],directives:[],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"tree"},arguments:[{kind:"Argument",name:{kind:"Name",value:"siteId"},value:{kind:"Variable",name:{kind:"Name",value:"siteId"}}},{kind:"Argument",name:{kind:"Name",value:"locale"},value:{kind:"Variable",name:{kind:"Name",value:"locale"}}},{kind:"Argument",name:{kind:"Name",value:"parentPath"},value:{kind:"Variable",name:{kind:"Name",value:"parentPath"}}},{kind:"Argument",name:{kind:"Name",value:"tags"},value:{kind:"Variable",name:{kind:"Name",value:"tags"}}},{kind:"Argument",name:{kind:"Name",value:"limit"},value:{kind:"Variable",name:{kind:"Name",value:"limit"}}},{kind:"Argument",name:{kind:"Name",value:"types"},value:{kind:"ListValue",values:[{kind:"EnumValue",value:"page"}]}},{kind:"Argument",name:{kind:"Name",value:"orderBy"},value:{kind:"Variable",name:{kind:"Name",value:"orderBy"}}},{kind:"Argument",name:{kind:"Name",value:"orderByDirection"},value:{kind:"Variable",name:{kind:"Name",value:"orderByDirection"}}},{kind:"Argument",name:{kind:"Name",value:"depth"},value:{kind:"Variable",name:{kind:"Name",value:"depth"}}}],directives:[],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"},arguments:[],directives:[]},{kind:"Field",name:{kind:"Name",value:"folderPath"},arguments:[],directives:[]},{kind:"Field",name:{kind:"Name",value:"fileName"},arguments:[],directives:[]},{kind:"Field",name:{kind:"Name",value:"title"},arguments:[],directives:[]},{kind:"InlineFragment",typeCondition:{kind:"NamedType",name:{kind:"Name",value:"TreeItemPage"}},directives:[],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"description"},arguments:[],directives:[]}]}}]}}]}}],loc:{start:0,end:516}};function t(e,i){if("FragmentSpread"===e.kind)i.add(e.name.value);else if("VariableDefinition"===e.kind){var a=e.type;"NamedType"===a.kind&&i.add(a.name.value)}e.selectionSet&&e.selectionSet.selections.forEach((function(e){t(e,i)})),e.variableDefinitions&&e.variableDefinitions.forEach((function(e){t(e,i)})),e.definitions&&e.definitions.forEach((function(e){t(e,i)}))}n.loc.source={body:"query blockIndexFetchPages (\n  $siteId: UUID!\n  $locale: String\n  $parentPath: String\n  $tags: [String]\n  $limit: Int\n  $orderBy: TreeOrderBy\n  $orderByDirection: OrderByDirection\n  $depth: Int\n  ) {\n  tree(\n    siteId: $siteId\n    locale: $locale\n    parentPath: $parentPath\n    tags: $tags\n    limit: $limit\n    types: [page]\n    orderBy: $orderBy\n    orderByDirection: $orderByDirection\n    depth: $depth\n    ) {\n    id\n    folderPath\n    fileName\n    title\n    ...on TreeItemPage {\n      description\n    }\n  }\n}\n",name:"GraphQL request",locationOffset:{line:1,column:1}};var r={};function d(e,i){for(var a=0;a<e.definitions.length;a++){var n=e.definitions[a];if(n.name&&n.name.value==i)return n}}n.definitions.forEach((function(e){if(e.name){var i=new Set;t(e,i),r[e.name.value]=i}})),function(e,i){var a={kind:e.kind,definitions:[d(e,i)]};e.hasOwnProperty("loc")&&(a.loc=e.loc);var n=r[i]||new Set,t=new Set,o=new Set;for(n.forEach((function(e){o.add(e)}));o.size>0;){var l=o;o=new Set,l.forEach((function(e){t.has(e)||(t.add(e),(r[e]||new Set).forEach((function(e){o.add(e)})))}))}t.forEach((function(i){var n=d(e,i);n&&a.definitions.push(n)}))}(n,"blockIndexFetchPages");class o extends e{static get styles(){return i`
      :host {
        display: block;
        margin-bottom: 16px;
      }

      ul {
        padding: 0;
        margin: 0;
        list-style: none;
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 0.5rem;
      }
      @media (min-width: 1024px) {
        ul {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      li {
        background-color: #fafafa;
        background-image: linear-gradient(to bottom,#fff,#fafafa);
        border-right: 1px solid rgba(0,0,0,.05);
        border-bottom: 1px solid rgba(0,0,0,.05);
        border-left: 5px solid rgba(0,0,0,.1);
        box-shadow: 0 3px 8px 0 rgba(116,129,141,.1);
        padding: 0;
        border-radius: 5px;
        font-weight: 500;
        display: flex;
        align-items: stretch;
        justify-content: stretch;
      }
      :host-context(body.body--dark) li {
        background-color: #222;
        background-image: linear-gradient(to bottom,#161b22, #0d1117);
        border-right: 1px solid rgba(0,0,0,.5);
        border-bottom: 1px solid rgba(0,0,0,.5);
        border-left: 5px solid rgba(255,255,255,.2);
        box-shadow: 0 3px 8px 0 rgba(0,0,0,.25);
      }
      li:hover {
        background-color: var(--q-primary);
        background-image: linear-gradient(to bottom,#fff,rgba(255,255,255,.95));
        border-left-color: var(--q-primary);
        cursor: pointer;
      }
      :host-context(body.body--dark) li:hover {
        background-image: linear-gradient(to bottom,#1e232a, #161b22);
        border-left-color: var(--q-primary);
      }
      li a {
        display: flex;
        color: var(--q-primary);
        padding: 1rem;
        text-decoration: none;
        flex: 1;
        flex-direction: column;
        justify-content: center;
        position: relative;
      }
      li a > span {
        display: block;
        color: #666;
        font-size: .8em;
        font-weight: normal;
        pointer-events: none;
      }
      li a > svg {
        width: 32px;
        position: absolute;
        right: 16px;
        pointer-events: none;
      }
      li a > svg path {
        fill: rgba(0,0,0,.2);
      }
      :host-context(body.body--dark) li a > svg path {
        fill: rgba(255,255,255,.2);
      }
      li:hover a > svg path, :host-context(body.body--dark) li:hover a > svg path {
        fill: color-mix(in srgb, currentColor 50%, transparent);
      }

      .no-links {
        color: var(--q-negative);
        border: 1px dashed color-mix(in srgb, currentColor 50%, transparent);
        border-radius: 5px;
        padding: 1rem;
      }
    `}static get properties(){return{path:{type:String},tags:{type:String},limit:{type:Number},orderBy:{type:String},orderByDirection:{type:String},depth:{type:Number},noResultMsg:{type:String},_loading:{state:!0},_pages:{state:!0}}}constructor(){super(),this._loading=!0,this._pages=[],this.path="",this.tags="",this.limit=10,this.orderBy="title",this.orderByDirection="asc",this.depth=0,this.noResultMsg="No pages matching your query."}async connectedCallback(){super.connectedCallback();try{const e=await APOLLO_CLIENT.query({query:n,variables:{siteId:WIKI_STATE.site.id,locale:WIKI_STATE.page.locale,parentPath:this.path,limit:this.limit,orderBy:this.orderBy,orderByDirection:this.orderByDirection,depth:this.depth,...this.tags&&{tags:this.tags.split(",").map((e=>e.trim())).filter((e=>e))}}});this._pages=e.data.tree.map((e=>({...e,href:e.folderPath?`/${e.folderPath}/${e.fileName}`:`/${e.fileName}`})))}catch(e){console.warn(e)}this._loading=!1}render(){return this._pages.length>0||this._loading?a`
      <ul>
        ${this._pages.map((e=>a`<li>
            <a href="${e.href}" @click="${this._navigate}">
              ${e.title}
              ${e.description?a`<span>${e.description}</span>`:null}
              <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="48px" height="48px">
                <path d="M 24 4 C 12.972292 4 4 12.972292 4 24 C 4 32.465211 9.2720863 39.722981 16.724609 42.634766 A 1.50015 1.50015 0 1 0 17.816406 39.841797 C 11.48893 37.369581 7 31.220789 7 24 C 7 14.593708 14.593708 7 24 7 A 1.50015 1.50015 0 1 0 24 4 z M 32.734375 6.1816406 A 1.50015 1.50015 0 0 0 32.033203 9.0136719 C 37.368997 11.880008 41 17.504745 41 24 C 41 33.406292 33.406292 41 24 41 A 1.50015 1.50015 0 1 0 24 44 C 35.027708 44 44 35.027708 44 24 C 44 16.385255 39.733331 9.7447579 33.453125 6.3710938 A 1.50015 1.50015 0 0 0 32.734375 6.1816406 z M 25.484375 16.484375 A 1.50015 1.50015 0 0 0 24.439453 19.060547 L 27.878906 22.5 L 16.5 22.5 A 1.50015 1.50015 0 1 0 16.5 25.5 L 27.878906 25.5 L 24.439453 28.939453 A 1.50015 1.50015 0 1 0 26.560547 31.060547 L 32.560547 25.060547 A 1.50015 1.50015 0 0 0 32.560547 22.939453 L 26.560547 16.939453 A 1.50015 1.50015 0 0 0 25.484375 16.484375 z"/>
              </svg>
            </a>
          </li>`))}
      </ul>
    `:a`
      <div class="no-links">${this.noResultMsg}</div>
    `}_navigate(e){e.preventDefault(),WIKI_ROUTER.push(e.target.getAttribute("href"))}}window.customElements.define("block-index",o);export{o as BlockIndexElement};
