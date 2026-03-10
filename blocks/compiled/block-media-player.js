import{r as e,i as t,x as r}from"./lit-element-4sfn79jP.js";class s extends e{static get styles(){return t`
      :host {
        display: block;
      }

      .container {
        overflow: hidden;
        border-radius: 5px;
        position: relative;
      }
    `}static get properties(){return{src:{type:String}}}constructor(){super()}async connectedCallback(){super.connectedCallback()}render(){return r`
      <div class="container">
        <video class="video-display" controls>
          <source src="${this.src}" type="video/mp4">
        </video>
      </div>
    `}}window.customElements.define("block-media-player",s);export{s as BlockMediaPlayerElement};
