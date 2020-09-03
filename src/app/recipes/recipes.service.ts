import { Recipe } from './recipes.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private recipes: Recipe[] = [];
  private recipesUpdated = new Subject<{recipes: Recipe[], recipeCount: number}>();
  private editRecipe = new Subject<Recipe>();

  constructor(private http: HttpClient, private router: Router) {}

  getRecipes(recipePerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${recipePerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; recipes: any, maxRecipes: number }>(
        'http://localhost:3000/api/recipes' + queryParams
      )
      .pipe(
        map((recipeData) => {
          return { recipes:recipeData.recipes.map((recipe) => {
            return {
              title: recipe.title,
              content: recipe.content,
              id: recipe._id,
              imagePath: recipe.imagePath,
              creator: recipe.creator
            };
          }), maxRecipes: recipeData.maxRecipes};
        })
      )
      .subscribe((transformRecipeData) => {
        this.recipes = transformRecipeData.recipes;
        this.recipesUpdated.next({recipes: [...this.recipes], recipeCount: transformRecipeData.maxRecipes});
      });
  }

  getRecipe(id: string) {

    return this.http
      .get<{recipe: Recipe, imagePath: string
      }>('http://localhost:3000/api/recipes/' + id)
      .pipe(
        map((recipeData) => {
          return {
            id: recipeData.recipe.id,
            title: recipeData.recipe.title,
            content: recipeData.recipe.content,
            imagePath: recipeData.recipe.imagePath,
            creator: recipeData.recipe.creator
          };
        })
      );
  }

  getRecipesUpdatedListener() {
    return this.recipesUpdated.asObservable();
  }

  addRecipes(title: string, content: string, image: File) {
    const recipeData = new FormData();
    recipeData.append('title', title);
    recipeData.append('content', content);
    recipeData.append('image', image, title);

    this.http
      .post<{ message: string; recipe: Recipe }>(
        'http://localhost:3000/api/recipes',
        recipeData
      )
      .subscribe((responseData) => {
        this.router.navigate(['/']);
      });
  }

  updateRecipe(
    id: string,
    title: string,
    content: string,
    image: File | string
  ) {
    let recipeData: Recipe | FormData;
    if (typeof (image) == 'object') {
      recipeData = new FormData();
      recipeData.append('id', id);
      recipeData.append('title', title);
      recipeData.append('content', content);
      recipeData.append('image', image, title);
    } else {
      recipeData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put('http://localhost:3000/api/recipes/' + id, recipeData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  deleteRecipe(recipeId: string) {
    return this.http
      .delete('http://localhost:3000/api/recipes/' + recipeId);
  }
}
