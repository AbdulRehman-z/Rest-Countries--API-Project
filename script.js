const topLevelCnt = document.querySelector(".top-level-container");

const container = document.querySelector(".container");
const form = document.querySelector(".form");
const countriesContainer = document.querySelector(".countries-container");
const detailContainer = document.querySelector(".detail-container");

const modeBtn = document.querySelector(".nav-bar__btn-dark-mode");
const dropBtn = document.querySelector(".dropdown__drop-btn");
const searchbtn = document.querySelector(".form__icon--btn");

const dropdownContainer = document.querySelector(".dropdown");
const dropdownContent = document.querySelector(".dropdown__content");
const hidden = document.querySelector(".dropdown--hidden");

const inputSearch = document.querySelector(".form__input");

/////////////////////////////////////
////////Main operations
class Renderer {
  #langCont;
  #clickedEl;
  #removedForm = [];
  #languages = [];
  #borders;
  #targetEl;
  #boxShadow;
  #modeColor;
  #modeInputColor;
  #mode;
  #modeState = false;
  #allCountries = [];
  #shadow = false;
  #hiddenState = false;
  #opacity = false;
  #display = false;
  constructor() {
    this._requestAll();
    dropdownContent.addEventListener("click", this._filterByRegion.bind(this));
    countriesContainer.addEventListener(
      "click",
      this._reqCountryInfo.bind(this)
    );
    dropBtn.addEventListener("click", this._dropDown.bind(this));
    modeBtn.addEventListener("click", this._toggleMode.bind(this));
    form.addEventListener("submit", this._reqCountryByName.bind(this));
    searchbtn.addEventListener("click", this._reqCountryByName.bind(this));

    // document.body.addEventListener("click", this._dropDown.bind(this));
  }
  //Helper func()
  _getJson(url) {
    return fetch(url).then((response) => {
      if (!response.ok)
        throw new Error(`Something went wrong:status_code${response.status}`);
      return response.json();
    });
  }

  _darkMode() {
    document.body.style.backgroundColor = "hsl(207, 26%, 17%)";
    this.#mode.forEach((el) => {
      el.style.backgroundColor = "hsl(209, 23%, 22%)";
    });

    this.#modeColor.forEach((el) => {
      el.style.color = "hsl(0, 0%, 100%)";
      el.style.fill = "hsl(0, 0%, 100%)";
    });

    this.#modeInputColor.forEach((el) => {
      el.style.color = "hsl(0, 0%, 82%)";
    });

    this.#boxShadow.forEach((el) => {
      el.style.boxShadow = "rgba(0, 0, 0, 0.33) 0px 1px 5px 0px";
    });
  }

  _lightMode() {
    document.body.style.backgroundColor = "hsl(0, 0%, 97%)";
    this.#mode.forEach((el) => {
      el.style.backgroundColor = "hsl(0, 0%, 100%)";
    });

    this.#modeColor.forEach((el) => {
      el.style.color = "hsl(200, 15%, 8%)";
      el.style.fill = "hsl(200, 15%, 8%)";
    });

    this.#modeInputColor.forEach((el) => {
      el.style.color = "hsl(0, 0%, 52%)";
    });

    this.#boxShadow.forEach((el) => {
      el.style.boxShadow = "rgba(99, 99, 99, 0.2) 0px 1px 5px 0px";
    });
  }

  _toggleMode() {
    this.#modeState ? this._lightMode() : this._darkMode();
    this.#modeState = !this.#modeState;
  }

  async _dropDown() {
    this.#opacity
      ? (dropdownContent.style.opacity = 0)
      : (dropdownContent.style.opacity = 1);
    this.#opacity = !this.#opacity;

    this.#shadow
      ? (dropBtn.style.boxShadow = "")
      : (dropBtn.style.boxShadow = "rgba(0, 0, 0, 0.2) 0px 1.5px 6px 0px");
    this.#shadow = !this.#shadow;

    {
      setTimeout(() => {
        this.#display
          ? (dropdownContent.style.display = "none")
          : (dropdownContent.style.display = "inline-block");
        this.#display = !this.#display;
      }, 55);
    }

    this.#hiddenState
      ? dropdownContent.classList.add("dropdown--hidden")
      : dropdownContent.classList.remove("dropdown--hidden");
    this.#hiddenState = !this.#hiddenState;
  }
  //request all countries
  async _requestAll() {
    try {
      const request = await this._getJson(`https://restcountries.com/v3.1/all`);
      request.forEach((country) => {
        this.#allCountries.push(country);
        this._renderCountry(country);
      });
    } catch (err) {
      console.log(err);
    }
  }
  //country renderer
  _renderCountry(countryData) {
    const population = countryData.population;
    const numberFormater = Intl.NumberFormat(navigator.language);
    const formatedPopulation = numberFormater.format(population);
    const capital = countryData.capital;
    const capitalName = capital ? capital : "No Capital";

    const html = `
         <article class="country mode mode-color shadow">
      <img class="country__img" src="${countryData.flags.png}" />
      <div class="country__data">
        <h3 class="country__name mode-color">${countryData.name.common}</h3>
        <div class="country__row-box">
          <p class="country__row mode-color">
            Population:<span class="country__row--span mode-input-color">${formatedPopulation}</span>
          </p>
          <p class="country__row mode-color">
            Region:<span class="country__row--span mode-input-color">${countryData.region}</span>
          </p>
          <p class="country__row mode-color">
            Capital:<span class="country__row--span mode-input-color">${capitalName}</span>
          </p>
        </div>
      </div>
    </article>
 `;
    countriesContainer.insertAdjacentHTML("beforeend", html);
    const mode = document.querySelectorAll(".mode");
    const modeColor = document.querySelectorAll(".mode-color");
    const modeInputColor = document.querySelectorAll(".mode-input-color");
    const boxShadow = document.querySelectorAll(".shadow");
    this.#mode = mode;
    this.#modeColor = modeColor;
    this.#modeInputColor = modeInputColor;
    this.#boxShadow = boxShadow;
  }
  //get country name on click for detailed info rendering
  _getCountryName() {
    const clickedEl = this.#targetEl.target.closest(".country");
    this.#clickedEl = clickedEl;

    if (!this.#clickedEl) return;

    // if (!clickedEl) return;
    const childNodes = clickedEl.childNodes[3];
    const countryName = childNodes.childNodes[1].innerText;
    const country = this.#allCountries.find(
      (curr) => curr.name.common === countryName
    );

    return country;
  }

  // Rendering the detailed info of country on click
  async _renderCountryData() {
    //Gettig Data out of API

    const country = this._getCountryName();

    if (!this.#clickedEl) return;

    console.log(country);
    const nativeNamekey_1 = Object.keys(country.name.nativeName)[0];
    const borders = country.borders;
    this.#borders = borders;
    const nativeName = country.name.nativeName[nativeNamekey_1].official;
    const currencyKey = Object.keys(country.currencies)[0];
    const currency = country.currencies[currencyKey].name;
    const languagesKey = Object.keys(country.languages);
    console.log(languagesKey);
    languagesKey.forEach((curr) => {
      const language = country.languages[curr];
      console.log(language);
      this.#languages.push(language);
    });

    const numberFormater = Intl.NumberFormat(navigator.language);
    const formatedPopulation = numberFormater.format(country.population);

    const html = `
      <button class="btn-back">
        <svg class="btn-back__icon">
          <use xlink:href="svg/sprite.svg#icon-arrow-long-left"></use></svg
        ><span class="btn-back__text ">Back</span>
      </button>

      <section class="sub-container">
        <div class="sub-container__col-1">
          
            <img src="${country.flags.svg}" alt="" class="sub-container__img" />
        
        </div>

        <div class="sub-container__col-2">
          <article class="sub-container__text-content">
            <h3 class="sub-container__heading mode-color">${country.name.common}</h3>
            <div class="sub-container__info">
              <div class="sub-container__block-1">
                <p class="sub-container__text mode-color">
                  Native Name:<span class="sub-container__span mode-input-color"
                    >${nativeName}</span
                  >
                </p>
                <p class="sub-container__text mode-color">
                  Population:<span
                    class="sub-container__span mode-input-color"
                  >${formatedPopulation}</span>
                </p>
                <p class="sub-container__text mode-color">
                  Region:<span
                    class="sub-container__span mode-input-color"
                  >${country.region}</span>
                </p>
                <p class="sub-container__text mode-color">
                  Sub Region:<span class="sub-container__span mode-input-color"
                    >${country.subregion}</span
                  >
                </p>
                <p class="sub-container__text mode-color">
                  Capital:<span class="sub-container__span mode-input-color"
                    >${country.capital}</span
                  >
                </p>
              </div>
              <div class="sub-container__block-2">
                <p class="sub-container__text mode-color">
                  Top Level Domain:<span
                    class="sub-container__span mode-input-color"
                    >${country.tld}</span
                  >
                </p>
                <p class="sub-container__text mode-color ">
                  Currencies:<span class="sub-container__span mode-input-color"
                    >${currency}</span
                  >
                </p>

                 <p class="sub-container__text mode-color languages-container">
                  Languages:
                </p>
              </div>
            </div>

            <div class="sub-container__block-3">
              <h4 class="sub-container__text sub-container__text--1 mode-color">
                Border Countries:
              </h4>

            </div>
          </article>
        </div>
      </section>
  
`;
    detailContainer.insertAdjacentHTML("beforeend", html);

    /////////////////////////////////////////////////
    ////Rendering borders
    const bordersBlock = document.querySelector(".sub-container__block-3");
    if (!bordersBlock) return;
    if (!this.#borders) {
      const html = `
       <button class="sub-container__btn-back">
                <span>No borders</span>
              </button>`;
      bordersBlock.insertAdjacentHTML("beforeend", html);
    }
    if (this.#borders) {
      this.#borders.forEach((country) => {
        const html = `
       <button class="sub-container__btn-back">
                <span>${country}</span>
              </button>`;
        bordersBlock.insertAdjacentHTML("beforeend", html);
      });
    }

    //Selecting html el after detailed info rendering
    const btnBack = document.querySelector(".btn-back");
    const modeColor = document.querySelectorAll(".mode-color");
    const modeInputColor = document.querySelectorAll(".mode-input-color");

    const langContainer = document.querySelector(".languages-container");
    this.#langCont = langContainer;

    this.#modeColor = modeColor;
    this.#modeInputColor = modeInputColor;

    if (this.#languages) {
      this.#languages.forEach((curr) => {
        const markUp = `<span class="sub-container__span mode-input-color"
                    >${curr}</span>`;
        this.#langCont.insertAdjacentHTML("beforeend", markUp);
      });
      const filteredArr = this.#languages.filter((curr) => curr === 0);
      this.#languages = filteredArr;
    }

    btnBack.addEventListener("click", this._renderDataAgain.bind(this));
  }

  // render country detailed info on click
  _reqCountryInfo(e) {
    this.#targetEl = e;

    this._renderCountryData();
    if (!this.#clickedEl) return;
    this._removeAllElements();
    this._removeAllCountries();
    !this.#modeState ? this._lightMode() : this._darkMode();
  }

  _renderDataAgain() {
    this.#removedForm.forEach((curr) => {
      topLevelCnt.appendChild(curr);
    });
    const arr = this.#removedForm.filter((curr) => curr === 0);
    console.log(arr);

    this.#allCountries.forEach((curr) => {
      this._renderCountry(curr);
    });
    !this.#modeState ? this._lightMode() : this._darkMode();

    detailContainer.innerHTML = "";
    countriesContainer.classList.remove("center");
  }

  //request country by name
  async _reqCountryByName(e) {
    try {
      e.preventDefault();
      this._removeAllCountries();
      const [request] = await this._getJson(
        `https://restcountries.com/v3.1/name/${inputSearch.value}`
      );
      console.log(request);
      inputSearch.value = "";
      inputSearch.blur();
      countriesContainer.classList.add("center");
      this._renderCountry(request);
      !this.#modeState ? this._lightMode() : this._darkMode();
    } catch (err) {
      console.log(err);
    }
  }
  // remove all el for rendering country detailed info
  _removeAllElements() {
    while (topLevelCnt.firstChild) {
      const removedForm = topLevelCnt.removeChild(topLevelCnt.firstChild);
      this.#removedForm.push(removedForm);
    }
  }
  //remove all countries
  _removeAllCountries() {
    while (countriesContainer.firstChild) {
      countriesContainer.removeChild(countriesContainer.firstChild);
    }
  }
  // filter all countries by region
  async _filterByRegion(e) {
    try {
      this._removeAllCountries();
      const clickedEl = e.target.closest(".dropdown__list").innerText;
      const region = clickedEl;
      //GaurdClause
      if (!clickedEl) return;

      const request = await this._getJson(
        `https://restcountries.com/v3.1/region/${region}`
      );
      request.forEach((country) => {
        this._renderCountry(country);
        !this.#modeState ? this._lightMode() : this._darkMode();
      });
    } catch (err) {
      console.log(err);
    }
  }
}

const app = new Renderer();
