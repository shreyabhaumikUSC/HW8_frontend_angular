import { Component, OnInit } from '@angular/core';	//sb-edited ...was "import { Component } from '@angular/core';"
import { ActivatedRoute, Router } from '@angular/router';  //sb-added

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {	//sb-added "implements OnInit"
  title = 'frontend-angular';
  public isCollapsed = true;

  constructor(private route: ActivatedRoute, private router: Router) { }  //sb-added
	
	ngOnInit(): void { }

  setIsCollapsedTrue(pageName: string, event: Event) { //sb-added
    event.preventDefault();
    this.router.navigate([pageName], {relativeTo: this.route});
    this.isCollapsed = true;
  }
}