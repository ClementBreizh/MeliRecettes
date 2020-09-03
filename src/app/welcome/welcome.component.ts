import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  private authStatusSub: Subscription;
  isAuth = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.isAuth = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthentificated => {
      this.isAuth = isAuthentificated;
    });
  }
}
