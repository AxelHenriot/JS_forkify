export const elements = {
    searchForm: document.querySelector('.search'),
    searchInput: document.querySelector('.search__field'),
    searchRes: document.querySelector('.results'),
    searchResList: document.querySelector('.results__list'),
    searchResPages: document.querySelector('.results__pages'),
    recipe: document.querySelector('.recipe'),
    shopping: document.querySelector('.shopping__list'),
    likesMenu: document.querySelector('.likes__field'),
    likesList: document.querySelector('.likes__list'),
    listDeleteAll: document.querySelector('.shopping__deleteAll'),
    listAddManually: document.querySelector('.add__btn__manually'),
    quantityInput: document.querySelector('.add__quantity'),
    unitInput: document.querySelector('.add__unit'),
    ingredientInput: document.querySelector('.add__ingredient')
};

export const elementStrings = {
    loader: 'loader'
};

export const renderLoader = parent => {
  const loader = `
            <div class="${elementStrings.loader}">
                <svg>
                    <use href="img/icons.svg#icon-cw"></use>
                </svg>
            </div>
                `;
    parent.insertAdjacentHTML('afterbegin', loader);
};

export const clearLoader = () => {
    const loader = document.querySelector(`.${elementStrings.loader}`)
    if (loader) loader.parentElement.removeChild(loader);
};
