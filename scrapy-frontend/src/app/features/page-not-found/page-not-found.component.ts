import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
})
export class PageNotFoundComponent {
  constructor(private router: Router, private location: Location) {}

  navigateToSearch() {
    this.router.navigate(['search']);
  }

  navigateToBack() {
    this.location.back();
  }
}
