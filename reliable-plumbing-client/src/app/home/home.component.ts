import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EnvironmentService } from '../services/environment.service';
import { Role } from '../models/enums';

@Component({
  selector: 'rb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('registeration') registerationTemplate: ElementRef;
  registerModalRef: NgbModalRef;

  @ViewChild('login') loginTemplate: ElementRef;
  loginModalRef: NgbModalRef;
  registeredUserEmail = null;

  @ViewChild('scheduleCall') scheduleCallTemplate: ElementRef;
  scheduleCallModalRef: NgbModalRef;

  isUserLoggedIn: boolean = false;
  currentUser = null;
  isSystemUser = false;

  constructor(private activatedRoute: ActivatedRoute, private modalService: NgbModal, private environmentService: EnvironmentService) { }

  ngOnInit() {
    this.isUserLoggedIn = this.environmentService.isUserLoggedIn;
    this.currentUser = this.environmentService.currentUser;
    this.isSystemUser = this.isUserLoggedIn && this.environmentService.currentUser.roles.findIndex(x => x == Role.Manager || x == Role.Technician) != -1;
  }

  ngAfterViewInit() {
    // Preloader
    // $(window).on('load', function () {
    //   $('#preloader').delay(100).fadeOut('slow', function () { $(this).remove(); });
    // });
    setTimeout(() => {
      $('#preloader').delay(100).fadeOut('slow', function () { $(this).remove(); });
    }, 10);

    // Hero rotating texts
    $("#hero .rotating").Morphext({
      animation: "flipInX",
      separator: ",",
      speed: 3000
    });

    // Initiate the wowjs
    new WOW().init();

    // Initiate nav menu animation
    $('.nav-menu').superfish({
      animation: { opacity: 'show' },
      speed: 400
    });

    // Mobile Navigation
    if ($('#nav-menu-container').length) {
      var $mobile_nav = $('#nav-menu-container').clone().prop({ id: 'mobile-nav' });
      $mobile_nav.find('> ul').attr({ 'class': '', 'id': '' });
      $('body').append($mobile_nav);
      $('body').prepend('<button type="button" id="mobile-nav-toggle"><i class="fa fa-bars"></i></button>');
      $('body').append('<div id="mobile-body-overly"></div>');
      $('#mobile-nav').find('.menu-has-children').prepend('<i class="fa fa-chevron-down"></i>');

      $(document).on('click', '.menu-has-children i', function (e) {
        $(this).next().toggleClass('menu-item-active');
        $(this).nextAll('ul').eq(0).slideToggle();
        $(this).toggleClass("fa-chevron-up fa-chevron-down");
      });

      $(document).on('click', '#mobile-nav-toggle', function (e) {
        $('body').toggleClass('mobile-nav-active');
        $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
        $('#mobile-body-overly').toggle();
      });

      $(document).click(function (e) {
        var container = $("#mobile-nav, #mobile-nav-toggle");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
          if ($('body').hasClass('mobile-nav-active')) {
            $('body').removeClass('mobile-nav-active');
            $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
            $('#mobile-body-overly').fadeOut();
          }
        }
      });
    } else if ($("#mobile-nav, #mobile-nav-toggle").length) {
      $("#mobile-nav, #mobile-nav-toggle").hide();
    }

    // Stick the header at top on scroll
    $("#header").sticky({ topSpacing: 0, zIndex: '50' });

    // Smoth scroll on page hash links
    $('a[href*="#"]:not([href="#"])').on('click', function () {
      if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        var target = $(this.hash);
        if (target.length) {

          var top_space = 0;

          if ($('#header').length) {
            top_space = $('#header').outerHeight();
          }

          $('html, body').animate({
            scrollTop: target.offset().top - top_space
          }, 1500, 'easeInOutExpo');

          if ($(this).parents('.nav-menu').length) {
            $('.nav-menu .menu-active').removeClass('menu-active');
            $(this).closest('li').addClass('menu-active');
          }

          if ($('body').hasClass('mobile-nav-active')) {
            $('body').removeClass('mobile-nav-active');
            $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
            $('#mobile-body-overly').fadeOut();
          }

          return false;
        }
      }
    });

    // Back to top button
    $(window).scroll(function () {

      if ($(this).scrollTop() > 100) {
        $('.back-to-top').fadeIn('slow');
      } else {
        $('.back-to-top').fadeOut('slow');
      }

    });

    $('.back-to-top').click(function () {
      $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
      return false;
    });

  }

  userRegistered(user) {
    this.registerModalRef.close();
    this.registeredUserEmail = user.email;
    this.openLoginPopup();
  }

  userLoggedIn() {
    this.loginModalRef.close();
    this.isUserLoggedIn = this.environmentService.isUserLoggedIn;
    this.currentUser = this.environmentService.currentUser;
    this.isSystemUser = this.isUserLoggedIn && this.environmentService.currentUser.roles.findIndex(x => x == Role.Manager || x == Role.Technician) != -1;
  }

  openRegisterPopup() {
    this.registerModalRef = this.modalService.open(this.registerationTemplate, { size: 'lg' })
  }

  openLoginPopup() {
    this.loginModalRef = this.modalService.open(this.loginTemplate)
  }

  openScheduleCallPopup() {
    this.scheduleCallModalRef = this.modalService.open(this.scheduleCallTemplate, { size: 'lg' });
  }

  logout() {
    this.environmentService.destroyLoginInfo();
    this.isUserLoggedIn = this.environmentService.isUserLoggedIn;
    this.currentUser = this.environmentService.currentUser;
  }
}
