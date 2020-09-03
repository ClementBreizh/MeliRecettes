import { Component, OnInit, OnDestroy } from '@angular/core';
import { Recipe } from '../recipes.model';
import { RecipesService } from "../recipes.service";
import { Subscription } from "rxjs";
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.component.html',
  styleUrls: ['./recipes-list.component.css']
})
export class RecipesListComponent implements OnInit {

  recipes: Recipe[] = [];
  private recipesSubscription: Subscription;
  totalRecipes= 0;
  recipePerPage= 5;
  pageSizeOption = [1, 5, 10, 20, 50, 100];
  currentPage = 1;
  private authStatusSub: Subscription;
  isAuth = false;
  userId: string;


  constructor(public recipesService: RecipesService, private authService: AuthService) {
   }

  ngOnInit() {
    this.recipesService.getRecipes(this.recipePerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.recipesSubscription = this.recipesService.getRecipesUpdatedListener()
    .subscribe((recipeData: {recipes: Recipe[], recipeCount: number}) => {
      this.totalRecipes = recipeData.recipeCount
      this.recipes = recipeData.recipes;
    });
    this.isAuth = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthentificated => {
      this.isAuth = isAuthentificated;
      this.userId = this.authService.getUserId();
    });
  }

  OnDestroy() {
    this.recipesSubscription.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onDelete(recipeId: string) {
    this.recipesService.deleteRecipe(recipeId).subscribe(() => {
      this.recipesService.getRecipes(this.recipePerPage, this.currentPage);
    });
  }

  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex +1;
    this.recipePerPage = pageData.pageSize;
    this.recipesService.getRecipes(this.recipePerPage ,this.currentPage);
  }
}
