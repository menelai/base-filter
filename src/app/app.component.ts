import {Component, OnInit} from '@angular/core';
import {TestFilter} from './test-filter';
import {ActivatedRoute, Router} from '@angular/router';
import {skip} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'base-filter-test';

  frontFilter = new TestFilter(20, this.route.queryParams);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.frontFilter.query$.subscribe(data => {
      console.log(data);
    });

    this.frontFilter.updated$.pipe(
      skip(1),
    ).subscribe(f => {
      console.log(f.toJSON());
      this.router.navigate([], {queryParams: f.toQueryParams()});
    });


    setTimeout(() => {
      this.frontFilter.page = 3;
      this.frontFilter.updated();
    }, 1000);

    setTimeout(() => {
      this.frontFilter.title = 'joj';
      this.frontFilter.updated();
    }, 2000);
  }
}
