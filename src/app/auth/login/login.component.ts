import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  private authStatusSub: Subscription

  constructor(public authService: AuthService) { }


  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe();
  }

  formErrorEmail() {
    return "Merci de rentrer une adresse email valide"
  };

  formErrorPwd() {
    return "Veuillez vérifier votre mot de passe"
  };

  onLogin(form: NgForm){
    if (form.invalid) {
      return;
    }
    this.authService.login(form.value.email, form.value.password);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
