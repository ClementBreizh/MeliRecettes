import { Component, OnInit } from '@angular/core';
import { Recipe } from '../recipes.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RecipesService } from '../recipes.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';


@Component({
  selector: 'app-recipes-create',
  templateUrl: './recipes-create.component.html',
  styleUrls: ['./recipes-create.component.css'],
})
export class RecipesCreateComponent implements OnInit {
  title = '';
  content = '';
  private mode = 'create';
  private recipeId: string;
  public recipe: Recipe;
  isLoading = true;
  form: FormGroup;
  imagePreview: string;

  constructor(
    public recipesService: RecipesService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, {
        validators: [Validators.required],
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    }
    );
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("recipeId")) {
        this.mode = "edit";
        this.recipeId = paramMap.get("recipeId");
        this.isLoading = true;
        this.recipesService.getRecipe(this.recipeId)
         .subscribe(recipeData => {

           this.isLoading = false;
          this.recipe = {
            id: recipeData.id,
            title: recipeData.title,
            content: recipeData.content,
            imagePath: recipeData.imagePath,
            creator: recipeData.creator
          };

          this.form.patchValue({
            title: this.recipe.title,
            content: this.recipe.content,
            image: this.recipe.imagePath
          })

          // this.form.controls['title'].setValue(this.recipe.title);
          // this.form.controls['content'].setValue(this.recipe.content);
          // this.form.controls['image'].setValue(this.recipe.imagePath);

        });
      } else {
        this.isLoading = false;
        this.mode = 'create';
        this.recipeId = null;
      }
    });
  }

  saveRecipes() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.recipesService.addRecipes(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.recipesService.updateRecipe(
        this.recipeId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }

  formErrorMessage() {
    return 'ce champ doit comporter au moins 3 caractères';
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    // convertir l'image
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
