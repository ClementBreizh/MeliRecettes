import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from "../auth/auth.service";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authListenerSub: Subscription
  userIsAuth = false;

  constructor(private authService: AuthService, private router: Router) { }


  getRouter() {
    return this.router;
  }

  ngOnInit(): void {
    this.userIsAuth = this.authService.getIsAuth();
    this.authListenerSub = this.authService.getAuthStatusListener()
    .subscribe(isAuthenticated => {
      this.userIsAuth = isAuthenticated;
    });
  }

  ngOnDestroy() {
    this.authListenerSub.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
