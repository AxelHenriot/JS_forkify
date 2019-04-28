// Global app controller

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';


import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';



import { elements, renderLoader, clearLoader } from './views/base';

//Global state of the app
    // - Search object
    // - Current recipe object
    // - Shopping list object
    // - Liked recipes
const state = {};
window.state = state;
// SEARCH CONTROLLER

const controlSearch = async () => {
    // 1) get the query from the view
    const query = searchView.getInput();
    
    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);
        
        // 3) Prepare UI for results
        
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
        // 4) Search for recipes
        await state.search.getResults();
        
        // 5) render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something went wrong with the search...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

// RECIPE CONTROLLER

const controlRecipe = async () => {
    // get ID from URL
    const id = window.location.hash.replace('#', '');
    
    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        //Highlight selected search item
        if (state.search) searchView.highlightSelected(id);
        
        // Create new recipe object
        state.recipe = new Recipe(id);
        
        try { 
            
        // Get recipe data and parse ingredients
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();
            
        // Calculate servings and time
        state.recipe.calcServings();
        state.recipe.calcTime();
            
        // Render the recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        } catch(err) {
            alert('Error processing recipe');
        }
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// LIST CONTROLLER

const controlList = () => {
    // create a new list if there is none yet
    if (!state.list) state.list = new List();
    // add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
       const item = state.list.addItem(el.count, el.unit, el.ingredient); 
        listView.renderItem(item);
    });
};

// handle delete and update list item events

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    // handle the delete event
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);
        //delete from UI
        listView.deleteItem(id);
        //handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }; 
});

elements.listDeleteAll.addEventListener('click', e => {
        // delete all items from the list
           
            state.list.items.forEach(el => {
                listView.deleteItem(el.id);
            });
            state.list.deleteAllItems();
    }
);

// add shopping list elements manually via input forms
elements.listAddManually.addEventListener('click', e => {
           let quantityManual = parseFloat(elements.quantityInput.value);
           let unitManual = elements.unitInput.value;
           let ingredientManual = elements.ingredientInput.value;
            if (!state.list) state.list = new List();
            const manualItem = state.list.addItem(quantityManual, unitManual, ingredientManual);
            listView.renderItem(manualItem);
            elements.quantityInput.value = "";
            elements.unitInput.value = "";
            elements.ingredientInput.value = "";
    }
);

// Restore shopping list when page loads

window.addEventListener('load', () => {
   state.list = new List();
    // restore shopping list
    state.list.readStorage();
    // render shopping list
    state.list.items.forEach(item => listView.renderItem(item));
});

// LIKE CONTROLLER
// for testing
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    //user has not yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // add like to the state
        const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
        // toggle the like button
        likesView.toggleLikeBtn(true);
        // add like to UI list
        likesView.renderLike(newLike);
    //user has already liked current recipe
    } else {
        // remove like from the state
        state.likes.deleteLike(currentID);
        // toggle the like button
        likesView.toggleLikeBtn(false);

        // remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes when page loads

window.addEventListener('load', () => {
   state.likes = new Likes();
    // restore likes
    state.likes.readStorage();
    // toggle like button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    // render liked recipes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});



// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
        state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});





