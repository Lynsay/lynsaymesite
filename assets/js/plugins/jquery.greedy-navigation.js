/*
* Greedy Navigation
*
* http://codepen.io/lukejacksonn/pen/PwmwWV
*
*/

var $nav = $('#site-nav');
var $btn = $('#site-nav button');
var $vlinks = $('#site-nav .visible-links');
var $vlinks_persist_tail = $vlinks.children("*.persist.tail");
var $hlinks = $('#site-nav .hidden-links');

function updateNav() {

  // Restore every item to the visible list first, so we can measure the
  // nav's fully-expanded width and decide all-or-nothing - rather than
  // incrementally moving one item at a time, the nav is either fully
  // expanded or fully collapsed into the dropdown, never a partial mix.
  var $hidden = $hlinks.children();
  if ($hidden.length > 0) {
    if ($vlinks_persist_tail.children().length > 0) {
      $hidden.each(function () {
        $(this).insertBefore($vlinks_persist_tail);
      });
    } else {
      $hidden.each(function () {
        $(this).appendTo($vlinks);
      });
    }
  }

  // Temporarily reveal the button so its real width can be measured -
  // a hidden ("display: none") element always reports a width of 0.
  $btn.removeClass('hidden');
  var availableSpace = $nav.width() - $btn.width() - 30;

  // The fully-expanded visible list doesn't fit: collapse every
  // non-persistent item into the dropdown at once (button stays visible).
  if ($vlinks.width() > availableSpace) {
    $vlinks.children("*:not(.persist)").each(function () {
      $(this).appendTo($hlinks);
    });

    // Everything fits after all: hide the button and dropdown again.
  } else {
    $btn.addClass('hidden');
    $btn.removeClass('close');
    $btn.attr('aria-expanded', 'false');
    $hlinks.addClass('hidden');
    $hlinks.attr('aria-hidden', 'true');
  }

  // update masthead height and the body/sidebar top padding
  var mastheadHeight = $('.masthead').height();
  $('body').css('padding-top', mastheadHeight + 'px');
  // Only the pinned sidebar (position: fixed, see _sass/layout/_sidebar.scss)
  // sits behind the fixed masthead and needs this dynamic clearance synced
  // to its real rendered height; the "folded up" stacked sidebar doesn't
  // overlap the masthead at all and gets its own fixed padding from CSS.
  // This used to check the "Links" button's visibility as a stand-in for
  // that same distinction, but the button hides at a smaller breakpoint
  // (925px) than the sidebar actually pins at (1024px), leaving a stray
  // inline padding-top applied in between.
  if ($(".sidebar").css("position") === "fixed") {
    $(".sidebar").css("padding-top", mastheadHeight + "px");
  } else {
    $(".sidebar").css("padding-top", "");
  }

}

// Window listeners

// Debounce: on a large/fast resize (e.g. an OS window snap, or a
// programmatic viewport change), the browser can take longer than a
// single animation frame to finish applying the CSS media queries this
// logic's width measurements depend on (verified: a bare resize handler
// can still read stale, pre-resize widths for several frames). Waiting
// until 150ms after the last resize event - well past that window, and
// short enough to feel instant - avoids deciding based on a stale
// layout, and avoids re-running on every tick of a drag-resize.
var updateNavTimer;
function scheduleUpdateNav() {
  clearTimeout(updateNavTimer);
  updateNavTimer = setTimeout(updateNav, 150);
}
$(window).on('resize', scheduleUpdateNav);
screen.orientation.addEventListener("change", scheduleUpdateNav);

$btn.on('click', function () {
  $hlinks.toggleClass('hidden');
  $(this).toggleClass('close');
  var expanded = $(this).hasClass('close');
  $(this).attr('aria-expanded', expanded);
  $hlinks.attr('aria-hidden', !expanded);
});

updateNav();