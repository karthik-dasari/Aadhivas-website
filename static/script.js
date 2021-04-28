/*******************************************************************************
 * Copyright 2018 Adobe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

/**
 * Element.matches()
 * https://developer.mozilla.org/enUS/docs/Web/API/Element/matches#Polyfill
 */
 if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Element.closest()
 * https://developer.mozilla.org/enUS/docs/Web/API/Element/closest#Polyfill
 */
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        "use strict";
        var el = this;
        if (!document.documentElement.contains(el)) {
            return null;
        }
        do {
            if (el.matches(s)) {
                return el;
            }
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

/*******************************************************************************
 * Copyright 2018 Adobe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
(function() {
    "use strict";

    var dataLayerEnabled = document.body.hasAttribute("data-cmp-data-layer-enabled");
    var dataLayer = (dataLayerEnabled)? window.adobeDataLayer = window.adobeDataLayer || [] : undefined;

    var NS = "cmp";
    var IS = "tabs";

    var keyCodes = {
        END: 35,
        HOME: 36,
        ARROW_LEFT: 37,
        ARROW_UP: 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN: 40
    };

    var selectors = {
        self: "[data-" + NS + '-is="' + IS + '"]',
        active: {
            tab: "cmp-tabs__tab--active",
            tabpanel: "cmp-tabs__tabpanel--active"
        }
    };

    /**
     * Tabs Configuration
     *
     * @typedef {Object} TabsConfig Represents a Tabs configuration
     * @property {HTMLElement} element The HTMLElement representing the Tabs
     * @property {Object} options The Tabs options
     */

    /**
     * Tabs
     *
     * @class Tabs
     * @classdesc An interactive Tabs component for navigating a list of tabs
     * @param {TabsConfig} config The Tabs configuration
     */
    function Tabs(config) {
        var that = this;

        if (config && config.element) {
            init(config);
        }

        /**
         * Initializes the Tabs
         *
         * @private
         * @param {TabsConfig} config The Tabs configuration
         */
        function init(config) {
            that._config = config;

            // prevents multiple initialization
            config.element.removeAttribute("data-" + NS + "-is");

            cacheElements(config.element);
            that._active = getActiveIndex(that._elements["tab"]);

            if (that._elements.tabpanel) {
                refreshActive();
                bindEvents();
            }

            // Show the tab based on deep-link-id if it matches with any existing tab item id
            var deepLinkItemIdx = CQ.CoreComponents.container.utils.getDeepLinkItemIdx(that, "tabpanel");
            if (deepLinkItemIdx) {
                var deepLinkItem = that._elements["tab"][deepLinkItemIdx];
                if (deepLinkItem && that._elements["tab"][that._active].id !== deepLinkItem.id) {
                    navigateAndFocusTab(deepLinkItemIdx);
                }
            }

            if (window.Granite && window.Granite.author && window.Granite.author.MessageChannel) {
                /*
                 * Editor message handling:
                 * - subscribe to "cmp.panelcontainer" message requests sent by the editor frame
                 * - check that the message data panel container type is correct and that the id (path) matches this specific Tabs component
                 * - if so, route the "navigate" operation to enact a navigation of the Tabs based on index data
                 */
                new window.Granite.author.MessageChannel("cqauthor", window).subscribeRequestMessage("cmp.panelcontainer", function(message) {
                    if (message.data && message.data.type === "cmp-tabs" && message.data.id === that._elements.self.dataset["cmpPanelcontainerId"]) {
                        if (message.data.operation === "navigate") {
                            navigate(message.data.index);
                        }
                    }
                });
            }
        }

        /**
         * Returns the index of the active tab, if no tab is active returns 0
         *
         * @param {Array} tabs Tab elements
         * @returns {Number} Index of the active tab, 0 if none is active
         */
        function getActiveIndex(tabs) {
            if (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].classList.contains(selectors.active.tab)) {
                        return i;
                    }
                }
            }
            return 0;
        }

        /**
         * Caches the Tabs elements as defined via the {@code data-tabs-hook="ELEMENT_NAME"} markup API
         *
         * @private
         * @param {HTMLElement} wrapper The Tabs wrapper element
         */
        function cacheElements(wrapper) {
            that._elements = {};
            that._elements.self = wrapper;
            var hooks = that._elements.self.querySelectorAll("[data-" + NS + "-hook-" + IS + "]");

            for (var i = 0; i < hooks.length; i++) {
                var hook = hooks[i];
                if (hook.closest("." + NS + "-" + IS) === that._elements.self) { // only process own tab elements
                    var capitalized = IS;
                    capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
                    var key = hook.dataset[NS + "Hook" + capitalized];
                    if (that._elements[key]) {
                        if (!Array.isArray(that._elements[key])) {
                            var tmp = that._elements[key];
                            that._elements[key] = [tmp];
                        }
                        that._elements[key].push(hook);
                    } else {
                        that._elements[key] = hook;
                    }
                }
            }
        }

        /**
         * Binds Tabs event handling
         *
         * @private
         */
        function bindEvents() {
            var tabs = that._elements["tab"];
            if (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    (function(index) {
                        tabs[i].addEventListener("click", function(event) {
                            navigateAndFocusTab(index);
                        });
                        tabs[i].addEventListener("keydown", function(event) {
                            onKeyDown(event);
                        });
                    })(i);
                }
            }
        }

        /**
         * Handles tab keydown events
         *
         * @private
         * @param {Object} event The keydown event
         */
        function onKeyDown(event) {
            var index = that._active;
            var lastIndex = that._elements["tab"].length - 1;

            switch (event.keyCode) {
                case keyCodes.ARROW_LEFT:
                case keyCodes.ARROW_UP:
                    event.preventDefault();
                    if (index > 0) {
                        navigateAndFocusTab(index - 1);
                    }
                    break;
                case keyCodes.ARROW_RIGHT:
                case keyCodes.ARROW_DOWN:
                    event.preventDefault();
                    if (index < lastIndex) {
                        navigateAndFocusTab(index + 1);
                    }
                    break;
                case keyCodes.HOME:
                    event.preventDefault();
                    navigateAndFocusTab(0);
                    break;
                case keyCodes.END:
                    event.preventDefault();
                    navigateAndFocusTab(lastIndex);
                    break;
                default:
                    return;
            }
        }

        /**
         * Refreshes the tab markup based on the current {@code Tabs#_active} index
         *
         * @private
         */
        function refreshActive() {
            var tabpanels = that._elements["tabpanel"];
            var tabs = that._elements["tab"];

            if (tabpanels) {
                if (Array.isArray(tabpanels)) {
                    for (var i = 0; i < tabpanels.length; i++) {
                        if (i === parseInt(that._active)) {
                            tabpanels[i].classList.add(selectors.active.tabpanel);
                            tabpanels[i].removeAttribute("aria-hidden");
                            tabs[i].classList.add(selectors.active.tab);
                            tabs[i].setAttribute("aria-selected", true);
                            tabs[i].setAttribute("tabindex", "0");
                        } else {
                            tabpanels[i].classList.remove(selectors.active.tabpanel);
                            tabpanels[i].setAttribute("aria-hidden", true);
                            tabs[i].classList.remove(selectors.active.tab);
                            tabs[i].setAttribute("aria-selected", false);
                            tabs[i].setAttribute("tabindex", "-1");
                        }
                    }
                } else {
                    // only one tab
                    tabpanels.classList.add(selectors.active.tabpanel);
                    tabs.classList.add(selectors.active.tab);
                }
            }
        }

        /**
         * Focuses the element and prevents scrolling the element into view
         *
         * @param {HTMLElement} element Element to focus
         */
        function focusWithoutScroll(element) {
            var x = window.scrollX || window.pageXOffset;
            var y = window.scrollY || window.pageYOffset;
            element.focus();
            window.scrollTo(x, y);
        }

        /**
         * Navigates to the tab at the provided index
         *
         * @private
         * @param {Number} index The index of the tab to navigate to
         */
        function navigate(index) {
            that._active = index;
            refreshActive();
        }

        /**
         * Navigates to the item at the provided index and ensures the active tab gains focus
         *
         * @private
         * @param {Number} index The index of the item to navigate to
         */
        function navigateAndFocusTab(index) {
            var exActive = that._active;
            navigate(index);
            focusWithoutScroll(that._elements["tab"][index]);

            if (dataLayerEnabled) {

                var activeItem = getDataLayerId(that._elements.tabpanel[index].dataset.cmpDataLayer);
                var exActiveItem = getDataLayerId(that._elements.tabpanel[exActive].dataset.cmpDataLayer);

                dataLayer.push({
                    event: "cmp:show",
                    eventInfo: {
                        path: "component." + activeItem
                    }
                });

                dataLayer.push({
                    event: "cmp:hide",
                    eventInfo: {
                        path: "component." + exActiveItem
                    }
                });

                var tabsId = that._elements.self.id;
                var uploadPayload = { component: {} };
                uploadPayload.component[tabsId] = { shownItems: [activeItem] };

                var removePayload = { component: {} };
                removePayload.component[tabsId] = { shownItems: undefined };

                dataLayer.push(removePayload);
                dataLayer.push(uploadPayload);
            }
        }
    }

    /**
     * Reads options data from the Tabs wrapper element, defined via {@code data-cmp-*} data attributes
     *
     * @private
     * @param {HTMLElement} element The Tabs element to read options data from
     * @returns {Object} The options read from the component data attributes
     */
    function readData(element) {
        var data = element.dataset;
        var options = [];
        var capitalized = IS;
        capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
        var reserved = ["is", "hook" + capitalized];

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var value = data[key];

                if (key.indexOf(NS) === 0) {
                    key = key.slice(NS.length);
                    key = key.charAt(0).toLowerCase() + key.substring(1);

                    if (reserved.indexOf(key) === -1) {
                        options[key] = value;
                    }
                }
            }
        }

        return options;
    }

    /**
     * Parses the dataLayer string and returns the ID
     *
     * @private
     * @param {String} componentDataLayer the dataLayer string
     * @returns {String} dataLayerId or undefined
     */
    function getDataLayerId(componentDataLayer) {
        return Object.keys(JSON.parse(componentDataLayer))[0];
    }

    /**
     * Document ready handler and DOM mutation observers. Initializes Tabs components as necessary.
     *
     * @private
     */
    function onDocumentReady() {
        var elements = document.querySelectorAll(selectors.self);
        for (var i = 0; i < elements.length; i++) {
            new Tabs({ element: elements[i], options: readData(elements[i]) });
        }

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var body = document.querySelector("body");
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // needed for IE
                var nodesArray = [].slice.call(mutation.addedNodes);
                if (nodesArray.length > 0) {
                    nodesArray.forEach(function(addedNode) {
                        if (addedNode.querySelectorAll) {
                            var elementsArray = [].slice.call(addedNode.querySelectorAll(selectors.self));
                            elementsArray.forEach(function(element) {
                                new Tabs({ element: element, options: readData(element) });
                            });
                        }
                    });
                }
            });
        });

        observer.observe(body, {
            subtree: true,
            childList: true,
            characterData: true
        });
    }

    if (document.readyState !== "loading") {
        onDocumentReady();
    } else {
        document.addEventListener("DOMContentLoaded", onDocumentReady);
    }

}());

$(document).ready(function () {
	$('.banner_text').each(function (index) {
		$(this)
			.find('p')
			.text(function (index, currentText) {
				var maxLength = 340;
				if (currentText.length >= maxLength) {
					return currentText.length > maxLength
						? currentText.substr(0, maxLength - 1) + '...'
						: currentText;
				} else {
					console.log(currentText, 'currentText');
					return currentText;
				}
			});
	});
});

$(document).ready(function () {
	// click on hamberger menu
	$('.utility-nav-hamberger-icon').on('click', function () {
		$('.utilitynav-hamberger-menu').css('width', '35.2%');
		$('.utilitynav-hamberger-menu').css('top', $('.utility-nav')[0].offsetTop);
	});
	// click on close menu
	$('.utilitynav-hamberger-menu-closebtn').on('click', function () {
		$('.utilitynav-hamberger-menu').css('width', '0');
	});
});

$(document).ready(function () {
	$('.banner_carousel').slick({
		dots: true,
		infinite: true,
		autoplay: $('.banner_carousel').hasClass('autoscroll') ? true : false,
		autoplaySpeed: 5000,
		slidesToShow: 1,
		slidesToScroll: 1,
		cssEase: 'linear',
		arrows: true,
		responsive: [
			{
				breakpoint: 991,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: false,
					dots: true,
				},
			}
		],
	});
	setCarouselDotsArrow();
});
$(window).resize(function () {
	if($('.banner_carousel').length)
	setCarouselDotsArrow();
})
function setCarouselDotsArrow() {
	setTimeout(() => {
		if ($(window).width() >= 992) {
			$('.banner_carousel').each((idx, element) => {
				const $parent = element;
				if($('.slick-dots', $parent).length) {
					$('.slick-prev', $parent).css('left', $('.slick-dots li:first-child', $parent).position().left - 30);
					$('.slick-next', $parent).css('left', $('.slick-dots li:last-child', $parent).position().left + 26);
				}
			});
		}
		if ($(window).width() < 992 && $('.banner_carousel .slick-current .olam-banner__content-container')[0]) {
			$('.banner_carousel .slick-dots').css(
				'top',
				$('.banner_carousel .slick-current .olam-banner__content-container')[0].offsetTop - 45
			);
		}

	}, 100);
}


$(document).ready(function() {
    let sidenavTopOffset = 0;
    if($('.side-nav')[0])
        sidenavTopOffset = $('.side-nav')[0].offsetTop;
    $(document).scroll(function(){
        if ($(document).scrollTop() >= sidenavTopOffset) {
            $('.side-nav').addClass('sticky');
        }
        else {
            $('.side-nav').removeClass('sticky');
        } 
      });
});
$(document).ready(function () {
	$('.info-pod-slider.info-pod--horizontal').not('.slick-initialized').slick({
		dots: false,
		infinite: true,
		autoplay: false,
		autoplaySpeed: 5000,
		slidesToShow: 2,
		slidesToScroll: 2,
		cssEase: 'linear',
		arrows: true,
		responsive: [
			{
				breakpoint: 769,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: true,
					dots: false,
				},
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: true,
					dots: false,
				},
			},
		],
	});
	$('.info-pod-slider.info-pod--vertical').not('.slick-initialized').slick({
		dots: false,
		infinite: true,
		autoplay: false,
		autoplaySpeed: 5000,
		slidesToShow: 3,
		slidesToScroll: 3,
		cssEase: 'linear',
		arrows: true,
		responsive: [
			{
				breakpoint: 1200,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 2
				},
			},
			{
				breakpoint: 768,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				},
			},
		],
	});
	$('.info-pod--vertical .info-pod__container').hover(
		function () {
			if ($(this).find('.info-pod__image').length !== 0) {
				$(this).addClass('info-pod__container--show');
			}
		},
		function () {
			if ($(this).find('.info-pod__image').length !== 0) {
				$(this).removeClass('info-pod__container--show');
			}
		}
	);
});
$(document).ready(function () {
	let productArray = [];
	let eventArray = [];
	let selectedFilters = {
		Product: '',
		EventType: '',
	};
	let $timeSensitiveCarousel;
	let $timeSensitiveSlickCache;
	//initializing Slick Carousel
	$timeSensitiveCarousel = $(
		'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card'
	)
		.not('.slick-initialized')
		.slick({
			dots: false,
			infinite: false,
			autoplay: false,
			prevArrow:
				'<button type="button" data-role="none" class="slick-prev slick-arrow" aria-label="Previous" role="button"></button>',
			nextArrow:
				'<button type="button" data-role="none" class="slick-next slick-arrow" aria-label="Next" role="button"></i></button>',
			autoplaySpeed: 5000,
			slidesToShow: 2,
			slidesToScroll: 1,
			cssEase: 'linear',
			arrows: true,
			responsive: [
				{
					breakpoint: 992,
					settings: {
						slidesToShow: 1,
						slidesToScroll: 1,
						arrows: true,
						dots: false,
					},
				},
			],
		});
	//Cloning Slick Slides into cache
	if ($timeSensitiveCarousel[0])
		$timeSensitiveSlickCache = $timeSensitiveCarousel[0].slick.$slides.clone(
			true,
			true
		);
	//Initializing Timeline
	setTimeline();
	setInactiveDatePosition();
	//Initializing Product and Event Type Filter Dropdown
	$(
		'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card .slick-list .slick-track .time-sensitive-card .time-sensitive-card-tag-date .time-sensitive-card-tag-container'
	).each(function (i, obj) {
		let productObj = JSON.parse(
			obj.querySelector('.time-sensitive-card-product-hdn').value
		);
		if (productArray.indexOf(productObj.class) == -1) {
			productArray.push(productObj.class);
			const anchorElement = document.createElement("a");
			anchorElement.setAttribute("class","time-sensitive-filter-product-item");
			anchorElement.setAttribute("href","#");
			anchorElement.setAttribute("data-value",productObj.class);
			anchorElement.appendChild(document.createTextNode(productObj.display));
			const listElement = document.createElement("li");
			listElement.appendChild(anchorElement);
			document.querySelector(
				'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-options'
			).appendChild(listElement);
		}
		let eventObj = JSON.parse(
			obj.querySelector('.time-sensitive-card-eventType-hdn').value
		);
		if (eventArray.indexOf(eventObj.class) == -1) {
			eventArray.push(eventObj.class);
			const anchorElement = document.createElement("a");
			anchorElement.setAttribute("class","time-sensitive-filter-eventType-item");
			anchorElement.setAttribute("href","#");
			anchorElement.setAttribute("data-value",eventObj.class);
			anchorElement.appendChild(document.createTextNode(eventObj.display));
			const listElement = document.createElement("li");
			listElement.appendChild(anchorElement);
			document.querySelector(
				'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-options'
			).appendChild(listElement);
		}
	});
	//Show hide Product Dropdown options
	$(
		'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-btn'
	).on('click', function () {
		$(
			'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-options'
		).css('display', 'none');
		if (
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-options'
			).css('display') == 'block'
		) {
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-options'
			).css('display', 'none');
		} else {
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-options'
			).css('display', 'block');
		}
	});
	//Show hide Event Type Dropdown options
	$(
		'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-btn'
	).on('click', function () {
		$(
			'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-options'
		).css('display', 'none');
		if (
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-options'
			).css('display') == 'block'
		) {
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-options'
			).css('display', 'none');
		} else {
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-options'
			).css('display', 'block');
		}
	});
	//Hiding dropdown options
	$(document).click(function () {
		$(
			'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-options'
		).css('display', 'none');
		$(
			'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-options'
		).css('display', 'none');
	});
	$(
		'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product'
	).click(function (e) {
		e.stopPropagation();
	});
	$(
		'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type'
	).click(function (e) {
		e.stopPropagation();
	});
	//Product filter on change
	$(
		'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-options .time-sensitive-filter-product-item'
	).click(function (e) {
		$(
			'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-btn .time-sensitive-filter-product-text'
		).text(e.currentTarget.innerText);
		$(
			'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-product .time-sensitive-filter-product-options'
		).css('display', 'none');
		selectedFilters.Product = e.target.dataset.value;
		FilterTimeline();
	});
	//Event filter on change
	$(
		'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-options .time-sensitive-filter-eventType-item'
	).click(function (e) {
		$(
			'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-btn .time-sensitive-filter-event_type-text'
		).text(e.currentTarget.innerText);
		$(
			'.time-sensitive .time-sensitive-container .time-sensitive-upcoming-events .time-sensitive-filters .time-sensitive-filter-event_type .time-sensitive-filter-event_type-options'
		).css('display', 'none');
		selectedFilters.EventType = e.target.dataset.value;
		FilterTimeline();
	});
	//Slick carousel slide change
	$(
		'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card'
	).on('afterChange', function (event, slick, currentSlide, nextSlide) {
		setTimeline();
	});

	function FilterTimeline() {
		$timeSensitiveCarousel[0].slick.unload();
		$timeSensitiveCarousel[0].slick.$slideTrack
			.children($timeSensitiveCarousel[0].slick.options.slide)
			.remove();
		$timeSensitiveSlickCache.appendTo(
			$timeSensitiveCarousel[0].slick.$slideTrack
		);
		$timeSensitiveCarousel[0].slick.reinit();
		$timeSensitiveCarousel[0].slick.goTo(0);
		if (selectedFilters.Product != '') {
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card'
			).slick('slickFilter', function () {
				return $(selectedFilters.Product, this).length === 1;
			});
		}
		if (selectedFilters.EventType != '') {
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card'
			).slick('slickFilter', function () {
				return $(selectedFilters.EventType, this).length === 1;
			});
		}
	}

	function getOrdinal(day) {
		if (day === 1 || day === 21 || day === 31) return 'st';
		else if (day === 2 || day === 22) return 'nd';
		else return 'th';
	}

	function setTimeline() {
		if (
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card .slick-list .slick-track .slick-current .time-sensitive-card .time-sensitive-card-tag-date .time-sensitive-card-date-container .time-sensitive-card-date-text'
			)[0]
		) {
			let active_date = $(
				'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card .slick-list .slick-track .slick-current .time-sensitive-card .time-sensitive-card-tag-date .time-sensitive-card-date-container .time-sensitive-card-date-text'
			)[0].innerText;
			let active_day = parseInt(active_date.substring(0, 2), 10);
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-active-text .time-sensitive-horizontal-line-active-text-date'
			).text(active_day);
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-active-text .time-sensitive-horizontal-line-active-text-datesuffix'
			).text(getOrdinal(active_day));
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-active-text .time-sensitive-horizontal-line-active-text-monthyear'
			).text(active_date.substring(2));
			if (
				$(
					'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card .slick-list .slick-track .slick-current'
				)
					.next()
					.find(
						'.time-sensitive-card .time-sensitive-card-tag-date .time-sensitive-card-date-container .time-sensitive-card-date-text'
					)[0]
			)
				$(
					'.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-inactive-text'
				).text(
					$(
						'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card .slick-list .slick-track .slick-current'
					)
						.next()
						.find(
							'.time-sensitive-card .time-sensitive-card-tag-date .time-sensitive-card-date-container .time-sensitive-card-date-text'
						)[0].innerText
				);
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-active-text'
			).css(
				'color',
				$(
					'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card .slick-list .slick-track .slick-current .time-sensitive-card .time-sensitive-card-tag-date .time-sensitive-card-date-container .time-sensitive-card-date-text'
				).css('color')
			);
			$(
				'.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-circle-active-inner'
			).css(
				'background-color',
				$(
					'.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card .slick-list .slick-track .slick-current .time-sensitive-card .time-sensitive-card-tag-date .time-sensitive-card-date-container .time-sensitive-card-date-text'
				).css('color')
			);
		}
	}
	$('.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card')
		.not('.slick-initialized')
		.slick({
			prevArrow: $('.time-sensitive-horizontal-line-circle-inactive'),
		});
	$('.time-sensitive-horizontal-line-circle-inactive').click(function () {
		$('.time-sensitive-horizontal-card').slick('slickNext');
	});
	$('.time-sensitive-horizontal-line-circle-active-outer').click(function () {
		$('.time-sensitive-horizontal-card').slick('slickPrev');
	});
	for (let i = 0; i < $('.time-sensitive-card-date-text').length; i++) {
		let card = $('.time-sensitive-card-date-text')[i].innerText;
		let a = moment().format('DD MMM YYYY');
		var A = new Date(`${a}`);
		var card1 = new Date(`${card}`);
		if (moment(A).diff(card1, 'days') > 0) {
			$('.time-sensitive-horizontal-line-circle-inactive').trigger('click');
		} else {
			break;
		}
	}
});

$(window).resize(function () {
	if($('.time-sensitive').length)
	setInactiveDatePosition();
})
function setInactiveDatePosition() {
	setTimeout(() => {
		if ($(window).width() >= 992) {
			if ($('.time-sensitive .time-sensitive-container .time-sensitive-horizontal-card .slick-list .slick-track .slick-current').next())
			{
				$('.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-circle-inactive').css(
					'left', $(window).width()/2
				);
				$('.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-inactive-text').css(
					'left', $(window).width()/2
				);
			} else {
				$('.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-circle-inactive').css(
					'display', 'none'
				);
				$('.time-sensitive .time-sensitive-container .time-sensitive-timeline .time-sensitive-horizontal-line .time-sensitive-horizontal-line-inactive-text').css(
					'display', 'none'
				);
			}
		}

	}, 0);
}


$(document).ready(function () {
	$('.testimonial_main_slider').not('.slick-initialized').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		fade: true,
		asNavFor: '.testimonial_slider',
	});
	$('.testimonial_slider')
		.not('.slick-initialized')
		.slick({
			dots: false,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 5000,
			slidesToShow: 4,
			slidesToScroll: 1,
			cssEase: 'linear',
			arrows: true,
			focusOnSelect: true,
			asNavFor: '.testimonial_main_slider',
			responsive: [
				{
					breakpoint: 769,
					settings: {
						slidesToShow: 1,
						slidesToScroll: 1,
						arrows: true,
						dots: false,
					},
				},
				{
					breakpoint: 480,
					settings: {
						slidesToShow: 1,
						slidesToScroll: 1,
						arrows: true,
						dots: false,
					},
				},
			],
		});
});

$(document).ready(function () {
	$('.shareWidget').hover(
		function () {
			$(this).find('.share_widget').removeClass('hidden');
		},
		function () {
			$(this).find('.share_widget').addClass('hidden');
		}
	);
	$('.share_widget .linkedIn').click(function () {
		let url = $(this).attr('data-url');
		let shareURL =
			'https://www.linkedin.com/shareArticle?mini=true&url=' + url + '&amp;';
		window.open(shareURL, '_blank', 'height=485,width=700');
	});
	$('.share_widget .twitter').click(function () {
		let url = $(this).attr('data-url');
		let shareURL = 'https://twitter.com/intent/tweet?&url=' + url;
		window.open(shareURL, '_blank', 'height=485,width=700');
	});
});

$(document).ready(function () {
	if (window.location.href.indexOf('search-results')<=0) {
		$('.search-area').addClass('hide');
        $('.megamenu-header-mobile').removeClass('hide');
    }
    else{
		$('.search-area').removeClass('hide');
		$('.search-icon-open').addClass('hide');
		$('.megamenu-header-mobile').addClass('hide');
    }
	$('.megamenu-tier1').addClass('hide');

	$('.search-input').focus();
	if($('.search-input')[0])
		$('.search-input')[0].value = '';
	if($('.search-input')[1])
		$('.search-input')[1].value = '';
	$('.search-autocomplete').css('display', 'none');
	$(
		'.megamenu-container .megamenu-mobile-main .search-area .search-autocomplete'
	).css('display', 'none');
	$('.megamenu-container .megamenu-main .search-area .search-autocomplete').css(
		'display',
		'none'
	);
	var mainObject = {};
	var array3, array6, array12, array24;
	var startIndex = (arrayIndexValue = 0);
	if (window.location.href.indexOf('search-results') > -1) {
		$(
			'.megamenu-container .megamenu-main .search-area .search-box .search-input'
		).val(window.location.search.substring(1).split('&')[0]);
		searchresultset();
		$(window).scroll();
	} else {
		$('.megamenu-container .megamenu-main .search-area').addClass('hide');
		$('.megamenu-tier1').removeClass('hide');
	}

	
	$(
		'.megamenu-container .megamenu-main .search-area .search-box .search-icon'
	).on('click', function () {
		startIndex = 0;
		var itemsInPage = 0;
		arrayIndexValue = 0;
		redirecttosearchresultpage();
	});

	
	$(
		'.megamenu-container .megamenu-mobile-main .search-area .search-box .search-icon'
	).on('click', function () {
		startIndex = 0;
		arrayIndexValue = 0;
		var itemsInPage = 0;
		redirecttosearchresultpage();
	});

	$('.search_result_filters .search_by_type').change(function () {
		$('.search_result_page .results').remove();
		$('.search_result_content .loading-item').show();
		if (
			'News & Events' ==
			$('.search_result_filters .search_by_type option:selected').val()
		) {
			$('.search_result_filters .search_by_date').css(
				'display',
				'inline-block'
			);
		} else {
			$('.search_result_filters .search_by_date').css('display', 'none');
		}

		var itemsInPage = 0;
		startIndex = 0;
		let result = mainObject;
		let index = 0
		for (index = 0; index < result.length; index++) {
			if (
				result[index].type == $('.search_result_filters .search_by_type').val()
			) {
				if (itemsInPage >= 0 && itemsInPage < 10) {
					fillData(result[index]);
					itemsInPage++;
				} else if (itemsInPage == 10) {
					startIndex = index;
					break;
				}
			}
			startIndex = index;
		}
		if(index >= result.length) {
			$('.search_result_content .loading-item').hide();
		}
	});
	$('.search_result_filters .search_by_date').change(function () {
		$('.search_result_page .results').remove();
		$('.search_result_content .loading-item').show();
		startIndex = 0;
		arrayIndexValue = 0;
		let arrayIndex = $(
			'.search_result_filters .search_by_date option:selected'
		).val();
		if (arrayIndex == 0) {
			filterDate(array3);
		} else if (arrayIndex == 1) {
			filterDate(array6);
		} else if (arrayIndex == 2) {
			filterDate(array12);
		} else {
			filterDate(array24);
		}
	});
	function redirecttosearchresultpage() {
		$('.search_result_topsection .olam-header-h4').text('');
		if (window.location.href.indexOf('search-results') > -1) {
			searchresultset();
		} else {
			let serachResultPageURL =
				'/search-results.html';
			if (
				$(
					'.megamenu-container .megamenu-main .search-area .search-box .search-input'
				)[0].value.length != 0
			) {
				window.open(
					serachResultPageURL +
						'?' +
						$(
							'.megamenu-container .megamenu-main .search-area .search-box .search-input'
						)[0].value
				);
				searchresultset();
			}
            else if (

                $(
                    '.megamenu-container .megamenu-mobile-main .search-area .search-box .search-input'
                )[0].value.length != 0
            ) {
                window.open(
                    serachResultPageURL +
                        '?' +
                        $(
                            '.megamenu-container .megamenu-mobile-main .search-area .search-box .search-input'
                        )[0].value
                );
                searchresultset();
            }
		}
	}
	function fillData(field) {
		if (field.description != undefined) {
			$('.search_result_page').append(
				'<div class="results"><img class="lazy" src="' +
					field.imgUrl +
					'"><div class="result_content"><div class="result_content_heading"><div class="olam-text-p4"><a href="' +
					field.pageUrl +
					'">' +
					field.pageTitle +
					'</a></div><p class="content_description olam-text-p5">' +
					field.description +
					'</p></div></div></div>'
			);
		} else {
			$('.search_result_page').append(
				'<div class="results"><img src="' +
					field.imgUrl +
					'"><div class="result_content"><div class="result_content_heading"><div class="olam-text-p4"><a href="' +
					field.pageUrl +
					'">' +
					field.pageTitle +
					'</a></div></div></div></div>'
			);
		}
	}
	function filterDate(arr) {
		let itemsInPage = 0;
		if (arr.length > arrayIndexValue) {
			let index = 0;
			for (index = startIndex; index < mainObject.length; index++) {
				if (
					mainObject[index].date == arr[arrayIndexValue] &&
					mainObject[index].type == 'News & Events'
				) {
					if (itemsInPage >= 0 && itemsInPage < 10) {
						fillData(mainObject[index]);
						itemsInPage++;
						arrayIndexValue++;
					} else if (itemsInPage == 10) {
						startIndex = index;
						break;
					}
				}
			}
			if(index >= mainObject.length) {
				$('.search_result_content .loading-item').hide();
			}
		}
	}
});

let isContactFormSubmitted = false;
$(function() {
  var spinner = $('#loader_contact');
  if($('#contact_popup').length > 0) {
  $.validator.addMethod(

    "regex",

    function(value, element, regexp) {


      if (regexp && regexp.constructor != RegExp) {

        regexp = new RegExp(regexp);
      } else if (regexp.global) regexp.lastIndex = 0;
      return this.optional(element) || regexp.test(value);
    }
  );

  $("form[name='contactform']").validate({


    rules: {
      firstName: "required",
      lastName: "required",
      subscribe: "required",
      company: "required",
      region: "required",
      contactNumber: {
        required: false,
        digits: true,
        minlength: 10,
        maxlength: 15
      },
      email: {
        required: true,
        email: true,
        regex: /^\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i
      }
    },

    messages: {
      firstName: "First Name is required",
      lastName: "Last Name is required",
      subscribe: "Please subscribe to proceed",
      company: "Company is required",
      region: "Please select region",

      contactNumber: {
        required: "This field is optional",
        minlength: "Your mobile number must be at least 10 characters long",
        maxlength: "Please enter not more than 15 characters"
      },
      email: {
        required: "Email is required",
        email: "Enter Valid Email Address",
      }

    },

    highlight: function(element, errorClass, validClass) {
      if (!isContactFormSubmitted) return;
      $(element).parent('div.form-group').addClass(errorClass).removeClass(validClass);
    },
    unhighlight: function(element, errorClass, validClass) {
      if (!isContactFormSubmitted) return;
      $(element).parent('div.form-group').addClass(validClass).removeClass(errorClass);
    },


    submitHandler: function(form) {

      console.log("form is submitted");
      spinner.show();

      var data = {
        firstName: $('#firstName').val(),
        lastName: $('#lastName').val(),
        email: $('#email').val(),
        contactNumber: $('#contactNumber').val(),
        company: $('#company').val(),
        region: $("#region option:selected").text(),
        isExistingCustomer: $("#existingCustomer option:selected").text(),
        product: $("#product option:selected").text(),
        enquiredVolume: $("#enquiredVolume option:selected").text(),
        bagsFormat: $('.bagsformat:checked').val(),
        comments: "comments",
        subscribe: "yes",
        recipientEmail: $('#recipientEmail').val()
      }
    }
  });
  }
});




function onInputEnter() {
  var inp = $("#firstName").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is there***");
    $('input.form-control-select#firstName').addClass("blur_inputs");

  }
  var inp = $("#lastName").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is lastName***");
    $('input.form-control-select#lastName').addClass("blur_inputs");

  }
  var inp = $("#email").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is email***");
    $('input.form-control-select#email').addClass("blur_inputs");

  }
  var inp = $("#contactNumber").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is contactNumber***");
    $('input.form-control-select#contactNumber').addClass("blur_inputs");

  }
  var inp = $("#company").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is company***");
    $('input.form-control-select#company').addClass("blur_inputs");

  }
  var inp = $("#region").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is region***");
    $('select.form-control-select#region').addClass("blur_inputs");

  }
  var inp = $("#existingCustomer").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is existingCustomer***");
    $('select.form-control-select#existingCustomer').addClass("blur_inputs");

  }
  var inp = $("#product").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is product***");
    $('select.form-control-select#product').addClass("blur_inputs");

  }
  var inp = $("#enquiredVolume").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is enquiredVolume***");
    $('select.form-control-select#enquiredVolume').addClass("blur_inputs");

  }
  var inp = $("#comments").val();
  if (jQuery.trim(inp).length > 0) {
    console.log("length is comments***");
    $('textarea.form-control-select#comments').addClass("blur_inputs");

  }

}

function submitClass() {
  isContactFormSubmitted = true;

}

$(document).ready(function() {
	/* Display the first profile on load */
	$(".olam-bod__content-container:first-child", ".olam-bod").show();
	$(".olam-bod__tile:first-child", ".olam-bod").addClass("olam-bod__tile--selected");

	$(".olam-bod__tile").on("click",function() {
		const $parent = $(this).closest(".olam-bod");
		const $container = $(".olam-bod__content-container", $parent);
		const selectedTileIndex = $(this).attr("data-tile-index");

		/* Select the Tile */
		$(".olam-bod__tile", $parent).removeClass("olam-bod__tile--selected");
		$(this).addClass("olam-bod__tile--selected");

		/* Hide other Profile and show the specific one */
		$container.hide();
		$("[data-profile-index='" + selectedTileIndex + "']", $parent).show();

		/* Scroll the window to the Profile section */
		$("html, body").animate({
			"scrollTop": $("[data-profile-index='" + selectedTileIndex + "']", $parent).position().top - $(".side-nav")[0].offsetHeight
		});
	 });
 });
$(document).ready(function () {
	let megamenu_tier2_height = 0;
	let megamenu_tier3_height = 0;
	let megamenu_tier3_desc = 0;
	$('.search-icon-text').on('click', function () {
		$('.search-area').removeClass('hide');
		$('.megamenu-tier1').addClass('hide');
		$('.search-icon-open').addClass('hide');

		$('.megamenu-header-mobile').addClass('hide');
		$('.search-input').focus();
		if($('.search-input')[0])
		$('.search-input')[0].value = '';
		if($('.search-input')[1])
			$('.search-input')[1].value = '';
		$(
			'.megamenu-container .megamenu-mobile-main .search-area .search-autocomplete'
		).css('display', 'none');
		$(
			'.megamenu-container .megamenu-main .search-area .search-autocomplete'
		).css('display', 'none');
	});

	$('.search-area-close').on('click', function () {
		$('.search-area').addClass('hide');
		$('.megamenu-tier1').removeClass('hide');
		$('.search-icon-open').removeClass('hide');

		$('.megamenu-header-mobile').removeClass('hide');
	});

	$('.megamenu-hamberger-btn').on('click', function () {
		$('.megamenu-hamberger-menu-close').removeClass('hide');
		$('.megamenu-hamberger-btn').addClass('hide');
		$('.megamenu-desc-mobile').removeClass('hide');
		if ($('.utility-nav-mobile')) {
			$('.utility-nav-mobile').removeClass('hide');
			$('.megamenu-mobile-main').appendTo('.megamenu-utilitynav-wrapper');
			$('.utility-nav-mobile').appendTo('.megamenu-utilitynav-wrapper');
		}
	});

	$('.megamenu-hamberger-menu-close').on('click', function () {
		$('.megamenu-hamberger-menu-close').addClass('hide');
		$('.megamenu-tier1').removeClass('hide');

		$('.megamenu-hamberger-btn').removeClass('hide');
		$('.megamenu-desc-mobile').addClass('hide');
		$('.utility-nav-mobile').addClass('hide');
	});

	$('.megamenu-main').on('mouseleave', function () {
		$(
			'.megamenu-tier1-desc, .megamenu-tier2-desc, .megamenu-tier3-desc'
		).addClass('megamenu-hide');
		$('.megamenu-tier1-list-item').removeClass(
			'megamenu-tier1-list-item-selected'
		);
	});

	$('.megamenu-tier1-list-item').on('mouseover focus', function () {
		event.stopPropagation();
		if ($(window).width() >= 1024) {
			$('.megamenu-tier1-desc').css('top', $(this)[0].parentElement.parentElement.parentElement.offsetTop + $(this)[0].parentElement.parentElement.parentElement.offsetHeight);
			if($(this).find('.megamenu-tier2-desc').length == 0) {
				$(this).find('.megamenu-tier2').addClass('megamenu-tier2-without-submenu');
				$(this).find('.megamenu-tier2-list-item').addClass('megamenu-tier2-list-item-without-submenu');
			}
			$('.megamenu-tier1-list-item').removeClass(
				'megamenu-tier1-list-item-selected'
			);
			$('.megamenu-tier2-list-item').removeClass(
				'megamenu-tier2-list-item-selected'
			);
			$('.megamenu-tier3-list-item').removeClass(
				'megamenu-tier3-with4tier-list-item-selected'
			);
			$('.megamenu-tier3-list-item').removeClass(
				'megamenu-tier3-with3tier-list-item-selected'
			);
			$('.megamenu-tier2-list-title').removeClass(
				'megamenu-tier2-list-selected-title'
			);
			$('.megamenu-tier3-list-text').removeClass(
				'megamenu-tier3-list-selected-text'
			);
			$('.megamenu-tier4-list-text').removeClass(
				'megamenu-tier4-list-selected-text'
			);
			$(
				'.megamenu-tier1-desc, .megamenu-tier2-desc, .megamenu-tier3-desc'
			).addClass('megamenu-hide');
			if (
				$(this)
					.find('.megamenu-tier1-desc:first')
					.find('.megamenu-tier2-list-item:first')
					.find('.megamenu-tier2-desc:first')
					.find('.megamenu-tier3-list-item:first')
					.find('div.megamenu-tier3-desc-with-4tiers').length !== 0
			) {
				$(this)
					.find('.megamenu-tier1-desc:first')
					.find('.megamenu-tier2-list-item:first')
					.find('.megamenu-tier2-desc:first')
					.find('.megamenu-tier3-list-item:first')
					.addClass('megamenu-tier3-with4tier-list-item-selected');
			} else if (
				$(this)
					.find('.megamenu-tier1-desc:first')
					.find('.megamenu-tier2-list-item:first')
					.find('.megamenu-tier2-desc:first')
					.find('.megamenu-tier3-list-item:first')
					.find('div.megamenu-tier3-desc-with-3tiers').length !== 0
			) {
				$(this)
					.find('.megamenu-tier1-desc:first')
					.find('.megamenu-tier2-list-item:first')
					.find('.megamenu-tier2-desc:first')
					.find('.megamenu-tier3-list-item:first')
					.addClass('megamenu-tier3-with3tier-list-item-selected');
			} 
			$(this)
				.addClass('megamenu-tier1-list-item-selected')
				.find('.megamenu-tier1-desc:first')
				.removeClass('megamenu-hide')
				.find('.megamenu-tier2-list-item:first')
				.addClass('megamenu-tier2-list-item-selected')
				.find('.megamenu-tier2-desc:first')
				.removeClass('megamenu-hide')
				.find('.megamenu-tier3-desc:first')
				.removeClass('megamenu-hide');
			$(this)
				.find('.megamenu-tier2-list-title:first')
				.addClass('megamenu-tier2-list-selected-title');
			$(this)
				.find('.megamenu-tier3-list-text:first')
				.addClass('megamenu-tier3-list-selected-text');
			$(this)
				.find('.megamenu-tier4-list-text:first')
				.addClass('megamenu-tier4-list-selected-text');
			$(this).find('.megamenu-tier2:first').css('height', 'fit-content');
			$(this).find('.megamenu-tier3-wrapper:first').css('height', 'fit-content');
			$(this).find('.megamenu-tier3-desc:first').css('height', 'fit-content');
			megamenu_tier2_height = parseInt($(this).find('.megamenu-tier2:first').css('height').substring(0,3));
			megamenu_tier3_height = $(this).find('.megamenu-tier3-wrapper:first').length == 0 ? 0 : $(this).find('.megamenu-tier3-wrapper:first').css('height') == '0px' ? 0 : parseInt($(this).find('.megamenu-tier3-wrapper:first').css('height').substring(0,3));
			megamenu_tier3_desc = $(this).find('.megamenu-tier3-desc:first').length  == 0 ? 0 : $(this).find('.megamenu-tier3-desc:first').css('height') == '0px' ? 0 : parseInt($(this).find('.megamenu-tier3-desc:first').css('height').substring(0,3));
			let final_height = megamenu_tier2_height > megamenu_tier3_height ? megamenu_tier2_height > megamenu_tier3_desc ? megamenu_tier2_height : megamenu_tier3_desc :
								megamenu_tier3_height > megamenu_tier3_desc ? megamenu_tier3_height : megamenu_tier3_desc;
			$(this).find('.megamenu-tier2:first').css('height', final_height);
			if($(this).find('.megamenu-tier3-wrapper:first').length > 0)
			$(this).find('.megamenu-tier3-wrapper:first').css('height', final_height);
			if($(this).find('.megamenu-tier3-desc:first').length > 0)
			$(this).find('.megamenu-tier3-desc:first').css('height', final_height);
		}
	});

	$('.megamenu-tier2-list-item').on('mouseover focus', function (event) {
		event.stopPropagation();
		if ($(window).width() >= 1024) {
			$('.megamenu-tier2-list-item').removeClass(
				'megamenu-tier2-list-item-selected'
			);
			$('.megamenu-tier3-list-item').removeClass(
				'megamenu-tier3-with4tier-list-item-selected'
			);
			$('.megamenu-tier3-list-item').removeClass(
				'megamenu-tier3-with3tier-list-item-selected'
			);
			$('.megamenu-tier2-list-title').removeClass(
				'megamenu-tier2-list-selected-title'
			);
			$('.megamenu-tier3-list-text').removeClass(
				'megamenu-tier3-list-selected-text'
			);
			$('.megamenu-tier4-list-text').removeClass(
				'megamenu-tier4-list-selected-text'
			);
			$('.megamenu-tier2-desc, .megamenu-tier3-desc').addClass(
				'megamenu-hide'
			);
			if (
				$(this)
					.find('.megamenu-tier2-desc:first')
					.find('.megamenu-tier3-list-item:first')
					.find('div.megamenu-tier3-desc-with-4tiers').length !== 0
			) {
				$(this)
					.find('.megamenu-tier2-desc:first')
					.find('.megamenu-tier3-list-item:first')
					.addClass('megamenu-tier3-with4tier-list-item-selected');
			} else if (
				$(this)
					.find('.megamenu-tier2-desc:first')
					.find('.megamenu-tier3-list-item:first')
					.find('div.megamenu-tier3-desc-with-3tiers').length !== 0
			) {
				$(this)
					.find('.megamenu-tier2-desc:first')
					.find('.megamenu-tier3-list-item:first')
					.addClass('megamenu-tier3-with3tier-list-item-selected');
			}
			$(this)
				.addClass('megamenu-tier2-list-item-selected')
				.find('.megamenu-tier2-desc:first')
				.removeClass('megamenu-hide')
				.find('.megamenu-tier3-desc:first')
				.removeClass('megamenu-hide');
			$(this)
				.find('.megamenu-tier2-list-title:first')
				.addClass('megamenu-tier2-list-selected-title');
			$(this)
				.find('.megamenu-tier3-list-text:first')
				.addClass('megamenu-tier3-list-selected-text');
			$(this)
				.find('.megamenu-tier4-list-text:first')
				.addClass('megamenu-tier4-list-selected-text');
			$(this).find('.megamenu-tier3-wrapper:first').css('height', 'fit-content');
			$(this).find('.megamenu-tier3-desc:first').css('height', 'fit-content');
			megamenu_tier3_height = $(this).find('.megamenu-tier3-wrapper:first').length == 0 ? 0 : $(this).find('.megamenu-tier3-wrapper:first').css('height') == '0px' ? 0 : parseInt($(this).find('.megamenu-tier3-wrapper:first').css('height').substring(0,3));
			megamenu_tier3_desc = $(this).find('.megamenu-tier3-desc:first').length  == 0 ? 0 : $(this).find('.megamenu-tier3-desc:first').css('height') == '0px' ? 0 : parseInt($(this).find('.megamenu-tier3-desc:first').css('height').substring(0,3));
			let final_height = megamenu_tier2_height > megamenu_tier3_height ? megamenu_tier2_height > megamenu_tier3_desc ? megamenu_tier2_height : megamenu_tier3_desc :
								megamenu_tier3_height > megamenu_tier3_desc ? megamenu_tier3_height : megamenu_tier3_desc;
			$('.megamenu-tier2').css('height', final_height);
			if($(this).find('.megamenu-tier3-wrapper:first').length > 0)
			$(this).find('.megamenu-tier3-wrapper:first').css('height', final_height);
			if($(this).find('.megamenu-tier3-desc:first').length > 0)
			$(this).find('.megamenu-tier3-desc:first').css('height', final_height);
		}
	});

	$('.megamenu-tier3-list-item').on('mouseover focus', function (event) {
		event.stopPropagation();
		if ($(window).width() >= 1024) {
			$('.megamenu-tier3-list-item').removeClass(
				'megamenu-tier3-with4tier-list-item-selected'
			);
			$('.megamenu-tier3-list-item').removeClass(
				'megamenu-tier3-with3tier-list-item-selected'
			);
			$('.megamenu-tier3-list-text').removeClass(
				'megamenu-tier3-list-selected-text'
			);
			$('.megamenu-tier4-list-text').removeClass(
				'megamenu-tier4-list-selected-text'
			);
			$('.megamenu-tier3-desc').addClass('megamenu-hide');
			if ($(this).find('div.megamenu-tier3-desc-with-4tiers').length !== 0) {
				$(this).addClass('megamenu-tier3-with4tier-list-item-selected');
			} else if ($(this).find('div.megamenu-tier3-desc-with-3tiers').length !== 0) {
				$(this).addClass('megamenu-tier3-with3tier-list-item-selected');
			}
			$(this).find('.megamenu-tier3-desc:first').removeClass('megamenu-hide');
			$(this)
				.find('.megamenu-tier3-list-text:first')
				.addClass('megamenu-tier3-list-selected-text');
			$(this)
				.find('.megamenu-tier4-list-text:first')
				.addClass('megamenu-tier4-list-selected-text');
			$(this).find('.megamenu-tier3-desc:first').css('height', 'fit-content');
			megamenu_tier3_desc = $(this).find('.megamenu-tier3-desc:first').length  == 0 ? 0 : $(this).find('.megamenu-tier3-desc:first').css('height') == '0px' ? 0 : parseInt($(this).find('.megamenu-tier3-desc:first').css('height').substring(0,3));
			let final_height = megamenu_tier2_height > megamenu_tier3_height ? megamenu_tier2_height > megamenu_tier3_desc ? megamenu_tier2_height : megamenu_tier3_desc :
								megamenu_tier3_height > megamenu_tier3_desc ? megamenu_tier3_height : megamenu_tier3_desc;
			$('.megamenu-tier2').css('height', final_height);
			if($('.megamenu-tier3-wrapper:first').length > 0)
			$('.megamenu-tier3-wrapper').css('height', final_height);
			if($(this).find('.megamenu-tier3-desc:first').length > 0)
			$(this).find('.megamenu-tier3-desc:first').css('height', final_height);
		}
	});

	$('.megamenu-tier4-list-item').on('mouseover focus', function (event) {
		event.stopPropagation();
		if ($(window).width() >= 1024) {
			$('.megamenu-tier4-list-text').removeClass(
				'megamenu-tier4-list-selected-text'
			);
			$(this)
				.find('.megamenu-tier4-list-text:first')
				.addClass('megamenu-tier4-list-selected-text');
		}
	});

	$('.megamenu-tier1-desc, .megamenu-tier2-desc, .megamenu-tier3-desc').on(
		'mouseover focus',
		function (event) {
			event.stopPropagation();
		}
	);

	$('.megamenu-tier1-caret').on('click', function () {
		if ($(window).width() < 1024) {
			$(this)
				.parent()
				.find('.megamenu-tier1-desc-mobile:first')
				.css('top', $(this).parent()[0].offsetTop + 60);
			if (
				$(this)
					.parent()
					.find('.megamenu-tier1-desc-mobile:first')
					.hasClass('megamenu-active')
			) {
				$(
					'.megamenu-tier1-desc-mobile, .megamenu-tier2-desc-mobile, .megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).removeClass('megamenu-active');
				$(
					'.megamenu-tier1-desc-mobile, .megamenu-tier2-desc-mobile, .megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).addClass('hide');
				$(this)
					.parent()
					.find('.fa-caret-down:first')
					.addClass('megamenu-active');
				$(this)
					.parent()
					.find('.fa-caret-up:first')
					.removeClass('megamenu-active');
				$(this)
					.parent()
					.find('.megamenu-tier1-desc-mobile:first')
					.removeClass('megamenu-active');
				$(this)
					.parent()
					.find('.megamenu-tier1-desc-mobile:first')
					.addClass('hide');
				$(this).parent().find('.fa-caret-down:first').removeClass('hide');
				$(this).parent().find('.fa-caret-up:first').addClass('hide');
			} else {
				$(
					'.megamenu-tier1-desc-mobile, .megamenu-tier2-desc-mobile, .megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).removeClass('megamenu-active');
				$(
					'.megamenu-tier1-desc-mobile, .megamenu-tier2-desc-mobile, .megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).addClass('hide');
				$('.fa-caret-down').removeClass('hide');
				$('.fa-caret-down').addClass('megamenu-active');
				$('.fa-caret-up').addClass('hide');
				$('.fa-caret-up').removeClass('megamenu-active');
				$(this).parent().find('.fa-caret-down:first').addClass('hide');
				$(this).parent().find('.fa-caret-up:first').addClass('megamenu-active');
				$(this)
					.parent()
					.find('.megamenu-tier1-desc-mobile:first')
					.removeClass('hide');
				$(this)
					.parent()
					.find('.megamenu-tier1-desc-mobile:first')
					.addClass('megamenu-active');
				$(this)
					.parent()
					.find('.fa-caret-down:first')
					.removeClass('megamenu-active');
				$(this).parent().find('.fa-caret-up:first').removeClass('hide');
			}
		}
	});

	$('.megamenu-tier2-caret').on('click', function () {
		if ($(window).width() < 1024) {
			event.stopPropagation();
			$(this)
				.parent()
				.find('.megamenu-tier2-desc-mobile:first')
				.css('top', $(this).parent()[0].offsetTop + 40);
			if (
				$(this)
					.parent()
					.find('.megamenu-tier2-desc-mobile:first')
					.hasClass('megamenu-active')
			) {
				$(
					'.megamenu-tier2-desc-mobile, .megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).removeClass('megamenu-active');
				$(
					'.megamenu-tier2-desc-mobile, .megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).addClass('hide');
				$(this)
					.parent()
					.find('.fa-caret-down:first')
					.addClass('megamenu-active');
				$(this)
					.parent()
					.find('.fa-caret-up:first')
					.removeClass('megamenu-active');
				$(this)
					.parent()
					.find('.megamenu-tier2-desc-mobile:first')
					.removeClass('megamenu-active');
				$(this)
					.parent()
					.find('.megamenu-tier2-desc-mobile:first')
					.addClass('hide');
				$(this).parent().find('.fa-caret-down:first').removeClass('hide');
				$(this).parent().find('.fa-caret-up:first').addClass('hide');
			} else {
				$(
					'.megamenu-tier2-desc-mobile, .megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).removeClass('megamenu-active');
				$(
					'.megamenu-tier2-desc-mobile, .megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).addClass('hide');
				$(this).parent().parent().find('.fa-caret-down').removeClass('hide');
				$(this)
					.parent()
					.parent()
					.find('.fa-caret-down')
					.addClass('megamenu-active');
				$(this).parent().parent().find('.fa-caret-up').addClass('hide');
				$(this)
					.parent()
					.parent()
					.find('.fa-caret-up')
					.removeClass('megamenu-active');
				$(this).parent().find('.fa-caret-down:first').addClass('hide');
				$(this).parent().find('.fa-caret-up:first').addClass('megamenu-active');
				$(this)
					.parent()
					.find('.megamenu-tier2-desc-mobile:first')
					.removeClass('hide');
				$(this)
					.parent()
					.find('.megamenu-tier2-desc-mobile:first')
					.addClass('megamenu-active');
				$(this)
					.parent()
					.find('.fa-caret-down:first')
					.removeClass('megamenu-active');
				$(this).parent().find('.fa-caret-up:first').removeClass('hide');
			}
		}
	});
	$('.megamenu-tier3-caret').on('click', function () {
		if ($(window).width() < 1024) {
			$(this)
				.parent()
				.find('.megamenu-tier3-desc-mobile:first')
				.css('top', $(this).parent()[0].offsetTop + 40);
			event.stopPropagation();
			if (
				$(this)
					.parent()
					.find('.megamenu-tier3-desc-mobile:first')
					.hasClass('megamenu-active')
			) {
				$(
					'.megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).removeClass('megamenu-active');
				$('.megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile').addClass(
					'hide'
				);
				$(this)
					.parent()
					.find('.fa-caret-down:first')
					.addClass('megamenu-active');
				$(this)
					.parent()
					.find('.fa-caret-up:first')
					.removeClass('megamenu-active');
				$(this)
					.parent()
					.find('.megamenu-tier3-desc-mobile:first')
					.removeClass('megamenu-active');
				$(this)
					.parent()
					.find('.megamenu-tier3-desc-mobile:first')
					.addClass('hide');
				$(this).parent().find('.fa-caret-down:first').removeClass('hide');
				$(this).parent().find('.fa-caret-up:first').addClass('hide');
			} else {
				$(
					'.megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile'
				).removeClass('megamenu-active');
				$('.megamenu-tier3-desc-mobile, .megamenu-tier4-desc-mobile').addClass(
					'hide'
				);
				$(this).parent().parent().find('.fa-caret-down').removeClass('hide');
				$(this)
					.parent()
					.parent()
					.find('.fa-caret-down')
					.addClass('megamenu-active');
				$(this).parent().parent().find('.fa-caret-up').addClass('hide');
				$(this)
					.parent()
					.parent()
					.find('.fa-caret-up')
					.removeClass('megamenu-active');
				$(this).parent().find('.fa-caret-down:first').addClass('hide');
				$(this).parent().find('.fa-caret-up:first').addClass('megamenu-active');
				$(this)
					.parent()
					.find('.megamenu-tier3-desc-mobile:first')
					.removeClass('hide');
				$(this)
					.parent()
					.find('.megamenu-tier3-desc-mobile:first')
					.addClass('megamenu-active');
				$(this)
					.parent()
					.find('.fa-caret-down:first')
					.removeClass('megamenu-active');
				$(this).parent().find('.fa-caret-up:first').removeClass('hide');
			}
		}
	});
	$(
		'.megamenu-tier1-item-mobile, .megamenu-tier2-item-mobile, .megamenu-tier3-item-mobile, .megamenu-tier4-item-mobile'
	).on('click', function () {
		if ($(window).width() < 1024) {
			event.stopPropagation();
		}
	});
});


$(document).ready(function() {
	$(".card-action-container .secondary-button").on("click",function() {
        const navigateTo = $(this).attr('href').substring(1);
        if($(`[data-anchorId='${navigateTo}']`).length > 0) {
            let topPosition = 0;
            if($(".side-nav")[0].offsetTop == 0) {
                topPosition = $(`[data-anchorId='${navigateTo}']`).position().top - $(".side-nav")[0].offsetHeight;
            } else {
                topPosition = $(`[data-anchorId='${navigateTo}']`).position().top - (2 * $(".side-nav")[0].offsetHeight);
            }
            $("html, body").animate({
                "scrollTop": topPosition
            });
        }
	 });
 });
$(document).ready(function () {
    var autoSuggest;

    /* content restriction for cards */

    /* Set youtube Video Height Starts */
    $(function () {

        $('#myVideo').parent().removeClass('def-VideoHeight');
    });
    /* Set youtube Video Height End */

    /* Subscribe footer banner - Start */

    //function to set Cookie for subscribe 
    /*
     * function to set Cookie for subscribe 
     *
     * @param string cookieName is to get cookiename
     * @param string cookievalue is to get cookievalue
     */
    function setCookie(cookieName, cookievalue) {
        var dateObj = new Date();
        var expires = "expires=" + dateObj.toGMTString();
        document.cookie = cookieName + "=" + cookievalue + ";path=/";
    }

    //function to get Cookie
    function getCookie(cookieName) {
        var name = cookieName + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    /* Disclaimer Start */
    var pageRestrict = $("#isRestricted").val();
    if (pageRestrict == 'true') {
        var userDisclaimerClosed = getCookie("disclaimerClose");
        if (userDisclaimerClosed == "" || userDisclaimerClosed == "false") {
            $("#disclaimerModal").modal();
        }
    }
    $('#disc-submit').click(function () {
        event.preventDefault();
        $('#disclaimerModal').modal('hide');
        setCookie("disclaimerClose", "true");
    });
    /* Disclaimer End */

    /* Cookie Start */
    $(".button-cookie-small").click(function () {
        $("#cookie-policy").hide();
        setCookie("cookieClose", "true");
    });
    /* Cookie End */



    //code to check cookie value 
    function checkCookie() {
        var userClosed = getCookie("subscribeClose");
        var userDisclaimerClosed = getCookie("disclaimerClose");
        var userCookieClosed = getCookie("cookieClose");
        if (userClosed == "" || userClosed == "false") {
            $(".notify-wrapper").show();
        }
        if (userDisclaimerClosed == "" || userDisclaimerClosed == "false") {
            $('#disclaimerModal').modal('show');
        }
        if (userCookieClosed == "" || userCookieClosed == "false") {
            $("#cookie-policy").show();
        }
    }

    checkCookie();

    //code to Hide subscribe tab from the page on click of close icon
    $(".close-btn").click(function () {
        $(".notify-wrapper").hide();
        setCookie("subscribeClose", "true");
    });

    //code to Hide subscribe tab from the page on click of close icon in small devices
    $(".mobile-close img").click(function () {
        $(this).parents(".navigator").slideUp().removeClass("in");
    });

    /* Subscribe footer banner - End */

    // slick carousel
    var multiCarousel = $(".carousel");

    multiCarousel.each(function () {
        if ($(this).is("#growingCarousel")) {
            $(this).not('.slick-initialized').slick({
                slidesToShow: 1,
                adaptiveHeight: true,
                dots: true,
                arrows: false,
                mobileFirst: true,
                autoplay: false,
                speed: 0,
                cssEase: 'linear'
            });
        } else if ($(this).is("#productCarousel")) {
            $(this).not('.slick-initialized').slick({
                slidesToShow: 1,
                adaptiveHeight: true,
                dots: true,
                speed: 0,
                arrows: false,
                customPaging: function (productCarousel, i) {
                    i = i + 1;;
                    var thumb = $(productCarousel.$slides[i]).data();
                    return '<a class="productListNumber">' + i + '</a>';
                },
                mobileFirst: true,
                cssEase: 'linear'
            });
        } else if ($(this).hasClass("js-eventcarousel")) {
            if ($(this).find(".slider-card").length > 1) {
                $(this).not('.slick-initialized').slick({
                    slidesToShow: 1,
                    adaptiveHeight: true,
                    dots: true,
                    arrows: false,
                    speed: 0,
                    mobileFirst: true,
                    cssEase: "linear"
                });
            }
        } else {
            $(this).not('.slick-initialized').slick();
        }
    })

    // you tube video in Tabbed component

    $(".productListNumber").click(function (e) {
        e.preventDefault();
        // changes the iframe src to prevent playback or stop the video playback
        $('.iframe-yt').each(function (index) {
            $(this).attr('src', $(this).attr('src'));
        });
    });

    //  Search modal show hide

    $("#fireSearchModal").click(function () {
        $("#searchModal").modal();
        $(".navbar").hide();
        $("#ulCategory").toggleClass("search-scroll");
    });

    //code to hide navbar menu when search modal is active

    $("body").on("click", ".search-modal-dialog", function (e) {
        if ($(e.target).hasClass('search-modal-dialog')) {
            var hidePopup = $(e.target.parentElement).attr('id');
            $('#' + hidePopup).modal('hide');
            $(".navbar").show();
            $("#ulCategory").hide();
            $('#search-form').trigger('reset');
            $("#ulCategory").children('li').remove();
        }
    });

    // code to Hide search modal and show navbar menu

    $("body").on("click", ".close-btn-search-modal", function (e) {
        var hidePopup = $(e.target.parentElement).attr('id');
        $('#' + hidePopup).modal('hide');
        $(".navbar").show();
        $("#ulCategory").hide();
        $('#search-form').trigger('reset');
        $("#ulCategory").children('li').remove();
        $("#ulCategory").toggleClass("search-scroll");
    });

    /* carousel for 3 Tiles - Start */

    var UNSLICK_AT = 992;

    var $win = $(window);
    var $wrapper = $('.tile-slider');

    if ($wrapper.length) {
        // Listen for resize when the unslick breakpoint is hit
        $wrapper.on('breakpoint', function (e, s, bp) {
            $win.on('resize', onWindowResize);
        });

        // Check once at page load if we're already at the large screen size
        if ($win.outerWidth() > UNSLICK_AT) {
            $win.on('resize', onWindowResize);
        }

        init();
    }

    function init() {
        $wrapper.not('.slick-initialized').slick({
            adaptiveHeight: true,
            dots: true,
            arrows: false,
            mobileFirst: true,
            speed: 0,
            responsive: [{
                breakpoint: UNSLICK_AT,
                settings: "unslick"
            }]
        });
    }

    function onWindowResize() {
        if ($win.outerWidth() < UNSLICK_AT + 1) {
            // Re-initialize Slick and turn off the window size listener
            init();
            $win.off('resize', onWindowResize);
        }
    }

    tileSliderSlick();
    $(window).on('resize', function () {
        tileSliderSlick();
    });

    function tileSliderSlick() {
        setTimeout(function () {
            if ($('.tile-slider').hasClass('slick-initialized')) {
                var parentWidth = $('.tile-slider .slick-slide').width();
                console.log(parentWidth);
                $('.tile-slider .slick-dots').width(parentWidth);
                $('.tile-slider .slick-list').css({
                    "margin-bottom": "40px"
                });
            }
        }, 100);
        if ($(window).innerWidth() < 768) {
            if ($('.tile-slider').hasClass('row')) {
                $('.tile-slider').removeClass('row');
                $('.tile-slider').addClass('shadow-8-10-15');
            }
            if ($('.tile-slider .card-wrapper').hasClass('shadow-8-10-15')) {
                $('.tile-slider .card-wrapper').removeClass('shadow-8-10-15');
                $('.tile-slider .card-wrapper').addClass('row');
            }
        } else {
            if ($('.tile-slider .card-wrapper').hasClass('row')) {
                $('.tile-slider .card-wrapper').removeClass('row');
                $('.tile-slider .card-wrapper').addClass('shadow-8-10-15');
            }
            if ($('.tile-slider').hasClass('shadow-8-10-15')) {
                $('.tile-slider').removeClass('shadow-8-10-15');
                $('.tile-slider').addClass('row');
            }
        }
    }
    /* carousel for 3 Tiles - End */

    /* Four tile start */
    if ($(window).innerWidth() >= 1023) {
        var fourTitleArr = [];
        $(".tile-img").each(function (index, value) {
            var currentHeight = $(this).outerHeight();
            console.log(currentHeight);
            fourTitleArr.push(currentHeight);
        });
        var maxTitleHeight = Math.max.apply(Math, fourTitleArr);
        console.log(maxTitleHeight);
        $(".tile-img").each(function (index, value) {
            $(this).height(maxTitleHeight);
        });
    }
    /* Four tile end */
    //added for search analytics feb'12'2020
    function searchAnlaytics(searchText, autoList, selectedText) {
        if (typeof _satellite != "undefined") {
            if (!digitalData.component.search) {
                digitalData.component["search"] = {};
                console.log("Search Erroe", digitalData.component.search)
            }
            digitalData.component.search["searchTerm"] = searchText;
            digitalData.component.search["autoSuggests"] = autoList;
            digitalData.component.search["suggestTerm"] = selectedText;
            if (searchText) {
                digitalData.component.search["suggestTerm"] = selectedText;
                console.log("test", selectedText)
                _satellite.track('searchSuggestSelection')
            } else {
                _satellite.track('internalSearch');
            }
        }
    }

    var count = 0;
    









    $(".arrow").click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 1000);
    });
    //added for search analytics
    /* All News page Refine Section Show Scrpit Start */
    $(document).on("click", ".refine-btn", function (e) {
        if ($(this).next().hasClass('hidden-xs') || $(this).next().hasClass('hidden-sm') || $(this).next().hasClass('hidden-md')) {
            $(this).next().removeClass('hidden-xs hidden-sm hidden-md');
            if ($('.allnewsDate-wrapper').hasClass('hidden-xs') || $(".allnewsDate-wrapper").hasClass('hidden-sm') || $(".allnewsDate-wrapper").hasClass('hidden-md')) {
                $('.allnewsDate-wrapper').removeClass('hidden-xs hidden-sm hidden-md');
            }
            $(this).removeClass('visible-xs visible-sm visible-md').hide();
        }

    });

    /* All News page Refine Section Show Scrpit End */
    var accordCount = 1;
    //$(".accordion").each(function() {
    $(".panel-group.accordion-wrapper").each(function () {
        $(this).attr("id", "accordion" + accordCount);
        $(this).find(".panel-collapse").attr("for", "accordion" + accordCount);
        /*
        $(this).find(".accordion-toggle").attr("href", "#collapse"+accordCount);
        $(this).find(".panel-collapse").attr("id", "collapse"+accordCount);
        */
        /*if(accordCount==1) {
                                                $(this).find(".panel-collapse").addClass("in");
        }
        else {
                                                $(this).find(".accordion-toggle").addClass("collapsed");
        }*/
        $(this).find(".accordion-toggle").addClass("collapsed");
        accordCount++;
    });
    /*$(document).on("click", ".accordion-toggle", function() {
        $(".accordion .accordion-toggle").not($(this)).addClass("collapsed").attr("aria-expanded","false");
        $(".accordion .panel-collapse").not($(this).parents(".panel-heading").next()).removeClass("in").attr("aria-expanded","false");
    });*/

    /* Product grid mobile accordion start */
    $(".products-list-accordion .product-list-title").click(function () {
        $(".products-list-accordion .product-list-title").not($(this)).removeClass("active");
        $(".products-list-accordion .product-list-content").not($(this).next()).slideUp();
        $(this).toggleClass("active");
        $(this).next().slideToggle();
    });
    /* Product grid mobile accordion end */

    /* twoDmap height css Start */
    $(".twoDmap.parbase").each(function () {
        var mapHeight = $(this).find("#map-canvas").height();
        $(this).height(mapHeight);
    });
    /* twoDmap height css End */
});

/* Parallax - Start */

$(function () {
    var $elements = $('.ScrollAction.notAnimated'); //contains all elements of nonAnimated class
    var $window = $(window);
    $window.on('scroll', function (e) {
        $elements.each(function (i, elem) { //loop through each element
            if ($(this).hasClass('animated')) // check if already animated
                return;
            animateMe($(this));
        });
    });
});

function animateMe(elem) {
    var winTop = $(window).scrollTop(); // calculate distance from top of window
    var winBottom = winTop + $(window).height();
    var elemTop = $(elem).offset().top; // element distance from top of page
    var elemBottom = elemTop + ($(elem).height() / 4);
    if ((elemBottom <= winBottom) && (elemTop >= winTop)) {
        // exchange classes if element visible
        $(elem).removeClass('notAnimated').addClass('animated');
    }
}

/* Parallax - End */

/* Mini Menu start */
$(document).ready(function () {

    $(".mini-menu-list li").click(function () {
        $("li").removeClass("mini-active");
        $(this).addClass("mini-active");
    });

    $(".sub-list").hide();
    $(".main-list").on("click", function () {
        $(".main-list .glyphicon").toggleClass("glyphicon-menu-right").toggleClass("glyphicon-menu-down");
        $(".sub-list").toggle();
    });
    var selected_txt = $("#mini-select li.selected_txt").text();
    //$("#mini-select li.selected_txt").hide();
    $(".main-list span").text(selected_txt);
    $("#mini-select").on("click", "li", function () {
        $(this).siblings().show();
        $(this).siblings().removeClass('selected_txt');
        $(this).addClass('selected_txt');
        $(this).hide();
        selected_txt = $(this).text();
        $(".main-list span").text(selected_txt);
        $(".sub-list").slideToggle();
    });

});
/* Mini-Menu - End */

$(document).ready(function () {
    if (window.innerWidth > 767) {
        /* bgimagecard page specific css script start */
        $(".bgimagecard").each(function () {
            if ($(this).find('.purpose-block').hasClass("full-width-pos-bot-right")) {
                var cardHeight = $(this).find('.purpose-block').height();
                if (cardHeight > 283) {
                    var bgimagecardBottom = cardHeight - 283;
                    $(this).find(".purpose-wrapper > img").css("margin-bottom", bgimagecardBottom);
                }
            }
        });
        /* bgimagecard page specific css script end */
    }
});

/* HTML video component to autoplay */
$(document).ready(function () {
    var htmlVideoList = document.getElementsByClassName('js-featureVideo')
    for (var index = 0; index < htmlVideoList.length; index++) {
        htmlVideoList[index].play();
    }
});
/* HTML video component to autoplay */

/* content restriction for cards */

$(function () {

    var charSize = 7;
    var lineHeight = 21;

    $('.ellipse-holder').each(function () {
        var $ellipsisText = $(this);
        var ellipseHolderHeight = $ellipsisText.outerHeight();
        var ellipseHolderWidth = $ellipsisText.width();
        if (ellipseHolderHeight > 180) {
            lineHeight = 22;
        } else {
            lineHeight = 21;
        }
        var titleHeight = $ellipsisText.find('h5').outerHeight(true);
        var descHeight = ellipseHolderHeight - (titleHeight);
        var charsperLine = ellipseHolderWidth / charSize;
        var totalLine = descHeight / lineHeight;
        var totalchars = Math.round((totalLine * charsperLine) * 90 / 100);
        var str = $ellipsisText.find('.ellipsis-content').text();
        var strLength = str.length;
        if (strLength > totalchars) {
            $ellipsisText.addClass("ellipsed");
            var res = str.substring(0, totalchars);
            $ellipsisText.find('.ellipsis-content').text(res);
        }
    });
});

$(document).ready(function () {

    $(".lp-dropdown-active").click(function () {
        $(this).find(".glyphicon").toggleClass("glyphicon-menu-down glyphicon-menu-up");
        $(this).next().slideToggle();
    });

    $(document).on("click", ".lp-dropdown-data a", function () {
        $(this).parents(".lp-dropdown-content").prev().find(".lp-dropdown-active-content").html($(this).html());
        $(this).parents(".lp-dropdown-content").slideToggle();
        $(this).parents(".lp-dropdown-content").prev().find(".glyphicon").toggleClass("glyphicon-menu-down glyphicon-menu-up");
    });
});

$(function () {

    var charSize = 9;
    var lineHeight = 27.6;

    $('.ellipse-holder').each(function () {
        var $ellipsisText = $(this);
        var ellipseHolderHeight = $ellipsisText.outerHeight();
        var ellipseHolderWidth = $ellipsisText.width();
        var titleHeight = $ellipsisText.find('h3').outerHeight(true);
        var descHeight = ellipseHolderHeight - (titleHeight);
        var charsperLine = ellipseHolderWidth / charSize;
        var totalLine = descHeight / lineHeight;
        var totalchars = Math.round((totalLine * charsperLine) * 90 / 100);
        var str = $ellipsisText.find('.ellipsis-content').text();
        var strLength = str.length;
        if (strLength > totalchars) {
            $ellipsisText.addClass("ellipsed");
            var res = str.substring(0, totalchars);
            $ellipsisText.find('.ellipsis-content').text(res);
        }
    });

});

function jobAnlayticsWorldwide(jobRole, location, supplyChain) {
    console.log("testjob1");
    if (typeof _satellite != "undefined") {
        if (!digitalData.careers) {
            digitalData["careers"] = {};
            console.log("Job Error", digitalData.careers)
        }
        console.log("Main-test1")
        digitalData.careers.jobRole= jobRole;
        //digitalData.careers.location = location;
        digitalData.careers.supplyChain = supplyChain;
        _satellite.track('jobApplication')
    }
}

$(".Worldwide.careers").click(function (e) {
    console.log("Main-test")
    let jobRole = "New Job"
    let location = "Worldwide"
    let supplyChain = "Olam"
    console.log("Job Test", supplyChain + location + jobRole);
    jobAnlayticsWorldwide(jobRole, location, supplyChain)
});

$(".Australia.careers").click(function (e) {
    console.log("Main-test")
    let jobRole = "New Job"
    let location = "Australia"
    let supplyChain = "Olam"
    console.log("Job Test", supplyChain + location + jobRole);
    jobAnlayticsWorldwide(jobRole, location, supplyChain)
});
$(".USA.careers").click(function (e) {
    console.log("Main-test")
    let jobRole = "New Job"
    let location = "USA"
    let supplyChain = "Olam"
    console.log("Job Test", supplyChain + location + jobRole);
    jobAnlayticsWorldwide(jobRole, location, supplyChain)
});
$(".Europe.careers").click(function (e) {
    console.log("Main-test")
    let jobRole = "New Job"
    let location = "Europe"
    let supplyChain = "Olam"
    console.log("Job Test", supplyChain + location + jobRole);
    jobAnlayticsWorldwide(jobRole, location, supplyChain)
});


//window.onload = getPageinfo();
window.digitalData = {
    "page": {
        "pageInfo": {}
    },
    "component": {}
};

///Error (Function)
function trackError(errorurl) {
    if (typeof _satellite != "undefined") {
        var ErrorPage = errorurl;
        _satellite.track(errorurl);
    }
}

///Socialmedia links function
function trackLink(linkLocation, linkName) {
    if (typeof _satellite != "undefined") {
        if (!digitalData.component.link) {
            digitalData.component["link"] = {};
        }
        digitalData.component.link["linkName"] = linkName;
        digitalData.component.link["linkType"]=linkLocation;
        _satellite.track('linkClick');
    }
}

function trackSocialMediaLinks(linkName) {
    if (typeof _satellite != "undefined") {
        //reseting link object
        digitalData.component["link"] = {};
        digitalData.component.link["linkType"] = linkName;
        _satellite.track('linkClick');
    }
}


$(document).ready(function() {

   /*function trackAppNavigation(navListfromPagetoLastclickedTabPath) {
        alert("analytics");

        if (typeof _satellite != "undefined") {
            alert("inside the satillite1");
            // digitalData.page["pageInfo"]={};
			console.log("page name set startinganalyticsss");
            console.log(navListfromPagetoLastclickedTabPath);
            var navListLength = navListfromPagetoLastclickedTabPath.length;
                console.log(navListLength);
                pageName = "";

            if (navListLength > 3) {
                alert("navlist3");
                digitalData.page["siteSubSection2"] = navListfromPagetoLastclickedTabPath[3];
                console.log( digitalData.page["siteSubSection2"] );
                pageName = ":" + navListfromPagetoLastclickedTabPath[3];
                alert("first"+pageName);

            } else {
                digitalData.page["siteSubSection2"] = "";
            }
            if (navListLength > 2) {
                alert("navlist2");
                digitalData.page["siteSubSection1"] = navListfromPagetoLastclickedTabPath[2];
                pageName = ":" + navListfromPagetoLastclickedTabPath[2] + pageName;
                alert("second"+pageName);
            } else {
                digitalData.page["siteSubSection1"] = "";
            }
            if (navListLength > 1) {
                alert("navlist1");
                digitalData.page["siteSection"] = navListfromPagetoLastclickedTabPath[1];
                pageName = ":" + navListfromPagetoLastclickedTabPath[1] + pageName;
                 alert("third"+pageName);
            } else {
                digitalData.page["siteSection"] = "";
            }
            if (navListLength > 0) {
alert("navlist1");

                pageName = navListfromPagetoLastclickedTabPath[0] + pageName;
                alert("fourth"+pageName);
                digitalData.page["pageName"] = res;
                alert(res);

            }


			console.log("page name set complete");
        }
    }

     var currentPath = window.location.pathname.split("?");
    var extractPath = currentPath[0].substring(1, currentPath[0].length);
    var extractPathList = extractPath.split("/");
    var correctpath = extractPathList.pop();
    var res = correctpath.split(".", 1);
    trackAppNavigation(extractPathList);*/


/*    function trackAppNavigation(navListfromPagetoLastclickedTabPath) {
        if (typeof _satellite != "undefined") {
            // digitalData.page["pageInfo"]={};
            console.log("page name set startinga");
            var navListLength = navListfromPagetoLastclickedTabPath.length,
                pageName = "";

            if (navListLength > 3) {
                digitalData.page["siteSubSection2"] = navListfromPagetoLastclickedTabPath[3];
                pageName = ":" + navListfromPagetoLastclickedTabPath[3];
            } else {
                digitalData.page["siteSubSection2"] = "";
            }
            if (navListLength > 2) {
                digitalData.page["siteSubSection1"] = navListfromPagetoLastclickedTabPath[2];
                pageName = ":" + navListfromPagetoLastclickedTabPath[2] + pageName;
            } else {
                digitalData.page["siteSubSection1"] = "";
            }
            if (navListLength > 1) {
                digitalData.page["siteSection"] = navListfromPagetoLastclickedTabPath[1];
                pageName = ":" + navListfromPagetoLastclickedTabPath[1] + pageName;
            } else {
                digitalData.page["siteSection"] = "";
            }
            if (navListLength > 0) {
                pageName = navListfromPagetoLastclickedTabPath[0] + pageName;
                digitalData.page["pageName"] = pageName;
            }
        }
    }

   var currentPath = window.location.pathname.split("?");
    var extractPath = currentPath[0].substring(1, currentPath[0].length);
    var extractPathList = extractPath.split("/");
    trackAppNavigation(extractPathList);*/

    // digitalData.page.pageInfo["pageName"] = window.location.pathname.split("/").pop();
    // _satellite.track("loaded_page");

    /*function trackArticle(articleId, articleName, articlePublishDate, articleCategory, wordCount) {
        if (typeof _satellite != "undefined") {
            if (!digitalData.article) {
                digitalData["article"] = {};
            }
            digitalData.article["articleTitle"] = articleName;
            digitalData.article["articleID"] = articleId;
            var str = articlePublishDate
                                var res = str.replace(/\D/g, "");
            function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('');

}
            if (articlePublishDate != "")
            {
            digitalData.article["articleDate"] =Number(formatDate(articlePublishDate.split(' ')[2].split(',')[0]+' ' +res.split(2)[0]+ ','+articlePublishDate.split(' ')[3]));
            }
            digitalData.article["articleCategory"] = articleCategory;
            digitalData.article["wordCount"] = wordCount;
        }
    }

    var article_title_analytics = $(".article.parbase h3").text();
    var article_id_analytics = currentPath[0].split("/").pop()
    var article_date_analytics = $(".article.parbase .tile-date").text();
    var article_category_analytics = extractPathList[2];
    var article_word_count_analytics = $(".intro-content-1").text().split(" ").length;

    if (article_id_analytics != "" && article_title_analytics != "" || article_date_analytics != "") {
        trackArticle(article_id_analytics, article_title_analytics, article_date_analytics, article_category_analytics, article_word_count_analytics);
    }*/


    ///Error (Declaration)
    if ($(document).find("title").text() == '404') {
        // digitalData.page.content["Error Page"] = window.location.href;
        digitalData.page.is404Error = true;
         var currentPath = window.location.pathname.split("?");
    var extractPath = currentPath[0].substring(1, currentPath[0].length);
    var extractPathList = extractPath.split("/");
            //trackAppNavigation(extractPathList);
    } else {
        digitalData.page.is404Error = false;
    }

    function getPageinfo() {
        if (typeof _satellite != "undefined") {
            if (!digitalData.page.content) {
                digitalData.page["content"] = {};
            }
            var referrer = document.referrer;
            digitalData.page.content["Previous Page Name"] = referrer;
            //_satellite.track("Previous Page Name");
        }
    }

    getPageinfo();

    $(".notification-btn.primary-button").click(function(e) {
        if (typeof _satellite != "undefined") {
            if (!digitalData.component.form) {
                digitalData.component["form"] = {};
            }
            digitalData.component.form["formName"] = "subscribe-entry-form";
            // digitalData.page.content["Form Start Event"] = "subscribe-form-show";
            _satellite.track('formStart');
        }
    });

    if($('#contact-myTab .active').text().trim()){
        digitalData.contacts={}
                                digitalData.contacts.filterType=$('#contact-myTab .active').text().trim();
    }


    $('#contact-myTab').click(function(e){
        setTimeout(function(){ 
            digitalData.olam={}
                                                digitalData.contacts.filterType=$('#contact-myTab .active').text().trim();
        }, 50);


    })

let region;
   $(".region-dropdown").click(function(e){
       console.log("regiontesting");
        if (typeof _satellite != "undefined") {
           setTimeout(function(){ 
                               var selText = $('.region-dropdown .lp-dropdown-active-content').text();
                                digitalData.olam={}
            console.log("****",selText);
            digitalData.mapLocation = selText;
                                region=selText.split('Select')[0];

            _satellite.track('mapLocationClick')

           }, 50);
        }




   // $("#tableButton").text(selText);
});

    //contactus filter






//let country;
    $(".contact-country").click(function(e){
        console.log("Testchk");
        if (typeof _satellite != "undefined") {
			setTimeout(function(){ 
            var selText = $('.contact-country .lp-dropdown-active-content').text();

                              //digitaData.contacts.location=region + '|'+ selText.split('Select')[0];
            digitalData.contacts.location = {};
            digitaData.contacts.location = selText;
             console.log("test1&&&&&&&&&", digitaData.contacts.location);
            //country=selText.split('Select')[0];
            console.log("&&&&&&&&&", country);

    		_satellite.track('contactsFilter')

    	}, 50);
    }
   })



    $(".product-dropdown").click(function(e){
         if (typeof _satellite != "undefined") {
           setTimeout(function(){ 
                               var selText = $('.product-dropdown .lp-dropdown-active-content').text();
                                digitalData.product={}
                                digitalData.product.productName=selText;
               console.log("test2@@@@@@",selText);

               		_satellite.track('contactsFilter')


   			}, 50);
       }
      })

    $(".submit-btn-title").click(function(e) {
        if (typeof _satellite != "undefined") {
            if (!digitalData.component.form) {
                digitalData.component["form"] = {};
            }

            var subscribeStatus = $("#subscribe").valid();
            if (subscribeStatus) {
                digitalData.component.form["formName"] = "subscribe-entry-form";
                // digitalData.page.content["Form Submission Event"] = "submit";
                _satellite.track('formSubmission');
            }
        }
    });
    
    ///Socialmedia links (Declaration)
    $(".main-footer a").click(function(e) {
        if (e.currentTarget.className === "info-content") {
            trackSocialMediaLinks(this.getAttribute("alt"));
        } else {
            trackLink("Footer", this.text);
        }
    });

    ///Socialmedia links (Declaration)
    $(".list-social a").click(function(e) {
        if (!digitalData.socialMedia) {
            digitalData["socialMedia"] = {};
        }
        digitalData.socialMedia["platform"] = this.text.trim();
            trackLink("Social Media", this.text);
    });

    ///Header links (Declaration)
    $(document).on("click",".navbar-nav a", function(){
        var currentLink = $(this).attr("href");
        if (currentLink.indexOf("products") > -1) {
            if (!digitalData.product) {
                digitalData["product"] = {};
            }
            var pathList = currentLink.split("/");
            digitalData.product["productName"] = pathList.pop().replace(".html", "");
            digitalData.product["productType"] = pathList[pathList.length - 1];
            trackLink("Product", this.text);
        } else {
            trackLink("Header", this.text);
        }
    });
    
    ///Side Navigation links (Declaration)
    $(document).on("click",".mini-menu a", function(){
        trackLink("Side Navigation", this.text);
    });
    

});


/*

function videoTrack(duration, videoName, player, playerTime) {
    if (typeof _satellite != "undefined") {
        console.log("Main-test2")
        if (!digitalData.component.video) {
            digitalData.component["video"] = {};
            console.log("video Error", digitalData.component.video)
        }
        console.log("video Erroe1", digitalData.component.video)

        digitalData.component.video.duration = duration;
        digitalData.component.video.videoName= videoName;
        digitalData.component.video.player = player;
        digitalData.component.video.playerTime= playerTime;

        _satellite.track('videoInteraction')
    }
}
$(".cocoa").click(function (e) {
    var symbol = $("iframe.youtube-videos")[0].src.indexOf("?") > -1 ? "&" : "?";
    $("iframe.youtube-videos")[0].src += symbol + "autoplay=1";
    let duration = "3.45 Min"
    let videoName = "Olam Cocoa 2018"
    let player = "Youtube"
    let playerTime = new Date();
    videoTrack(duration, videoName, player, playerTime)
   // $('.cocoa').hide()
});

$(".Our.Corporate.Video").click(function (e) {
    var symbol = $("iframe.youtube-videos")[0].src.indexOf("?") > -1 ? "&" : "?";
    $("iframe.youtube-videos")[0].src += symbol + "autoplay=1";
    let duration = "3.38 Min"
    let videoName = "Our Corporate Video"
    let player = "Youtube"
    let playerTime = new Date();
    videoTrack(duration, videoName, player, playerTime)
    //$('.Our.Corporate.Video').hide()
});
$(".careers").click(function (e) {
   var symbol = $("iframe.youtube-videos.careers")[0].src.indexOf("?") > -1 ? "&" : "?";
    $("iframe.youtube-videos.careers")[0].src += symbol + "autoplay=1";
    let duration = "4.02 Min"
    let videoName = "Future Leaders Programme"
    let player = "Youtube"
    let playerTime = new Date();
    videoTrack(duration, videoName, player, playerTime)
    //$('.careers').hide()
});

$(".coffee").click(function (e) {
    var symbol = $("iframe.youtube-videos")[0].src.indexOf("?") > -1 ? "&" : "?";
    $("iframe.youtube-videos")[0].src += symbol + "autoplay=1";
    let duration = "6.48 Min"
    let videoName = "Olam Coffee - Tackling Cafe Roya in Mexico (English)"
    let player = "Youtube"
    let playerTime = new Date();
    videoTrack(duration, videoName, player, playerTime)
   // $('.coffee').hide()
});
*/


$(document).ready(function() {
    //  To hide footer subscribe banner
    $(".close-btn").click(function() {
        $(".notify-wrapper").hide();
    });
});
/* Subscribe overlay validation - Start */



    $(function() {
        $("#subscribe").validate({
            // Specify validation rules
            rules: {

                firstname: {
                    required: true,

                },
                lastname: {
                    required: true,

                },
                country: {
                    required: true,
                },
                industry: {
                    required: true,
                },
                job: {
                    required: true,
                },
                checkbox: {
                    required: true,
                },
                 googlecapcha: {
                    required: true,
                },
                email: {
                    required: true,
                    email: true,
                }
            },
            // Specify validation error messages
            messages: {

                 firstname: {
                    required: "First Name is required",

                },
                lastname: {
                    required: "Last Name is required",

                },
                country: {
                    required: "Select Country",
                },
                industry:

                {
                    required: "Select Industry",
                },
                job: {
                    required: "Select Job Position",
                },
                checkbox: {
                    required: "Please agree to the privacy policy to proceed",
                },
                googlecapcha: {
                    required: "Please fill",
                },
                email: {
                    required: "Email is required",
                    email: "Enter Valid Email Address",
                }
            },
            // Make sure the form is submitted to the destination defined
            // in the "action" attribute of the form when valid
            submitHandler: function(form) {
                // form.submit();
                if ($('#subscribe').valid()) {
                    sendSubscriptionList();
                }

            },
            onkeyup: function(element) {

                if (element.id == 'email') {
                    return false;
                }
            }


        });

                             var date = new Date();
                  var timestamp = date.getTime();

         function getSubcribeList() {

                    var chkArray = [];

                    $('#checkbox-multiselect').find('input[type=checkbox]:checked').each(function() {
                     chkArray.push($(this).val());
                    });
                    if (chkArray.length > 0) {
                        return chkArray.join();
                    }
                  }

                 




      function subscribeResultIterate(responseString, type) {
        var result = "";
          if (responseString != "") {
              //var resultsIteration = responseString.split(",");
              for (var index = 0 ; index < responseString.length; index++) {
                  if (type== "Success") {
                      result += "<div class=\"alert alert-success\"><strong>Success!</strong> "+ responseString[index] +"</div>";
                  } else if (type== "Failure") {
                      result += "<div class=\"alert alert-danger\"><strong>Failure!</strong> "+ responseString[index] +"</div>";
                  }
              }
          }
          return result;
      }

      function subscribeResult(response) {
          var result = "";
          if (response.Success !== undefined) {
              result += subscribeResultIterate(response.Success, "Success");
          }
          if (response.Failure !== undefined) {
              result += subscribeResultIterate(response.Failure, "Failure");
          }

           var ResponeResultsubcribepage ="<div class=\"panel panel-info js-subscribeResult\"><div class=\"panel-heading\"><b>Thank you for sharing your details. We will keep you up-to-date with the latest Olam news and information. In the meantime, why not explore our products and services, or read about what we’ve been doing recently in our news section</b></div><div class=\"panel-body\"><button type=\"button\" id=\"btntakehome\" class=\"btn btn-primary  pull-right\">Take me to home page</button></div></div>"

          var subcribeResponeResult = "<div class=\"panel panel-info js-subscribeResult\"><div class=\"panel-heading\"><b>Thank you for your request. Your subscription request generated the following results;</b></div><div class=\"panel-body\">"+ result +"<button type=\"button\" id=\"btnOK\" class=\"btn btn-primary  pull-right\">OK</button></div></div>";


    if (window.location.href.indexOf('subscribe.html') > -1) {
      console.log("your url contains the name subscribe.html");

          $("#subscribe").append(ResponeResultsubcribepage);
}
          else

              $("#subscribe").append(subcribeResponeResult);




          $("#btnOK").on("click", function() {

              $('#subscribe > .form-group').show();
              $(".js-subscribeResult").remove();
              $("#subscribe").trigger('reset');
              grecaptcha.reset();
              var selectObj = $("select > option[hidden]");
              var selectTextbox = ["Select country", "Select industry", "Select job position"];
              $.each(selectObj, function(index, value) {
                  $(this).text(selectTextbox[index]);
              });
          });
      }

                  function sendSubscriptionList() {
                      var subcriberList = getSubcribeList();
                      $.ajax({
                          url: "/bin/MailChimp",
                          type: "GET",
                          dataType: "json",
                          cache: false,
                          data: {
                              email: $("#email").val(),
                              firstName: $("#firstname").val(),
                              lastName: $("#lastname").val(),
                              country: $("#country option:selected").val(),
                              industry: $("#industry option:selected").val(),
                              jobPosition: $("#job option:selected").val(),
                    agree: $("#agree option:selected").val(),
                              subcribe: subcriberList,
                              timestamp: timestamp,
                     g_recaptcha_response: grecaptcha.getResponse()  
                          },
                          beforeSend: function() {
                              
                          },
                          success: function(response) {
                  $(".js-subscribeResult").remove();
                  subscribeResult(response);
                  $('#subscribe > .form-group').hide();
                     grecaptcha.reset();
                          }
                      });
                  }



    });

$(document).ready(function() { 
    // reset form values once the modal is closed
    $('#formSubscribeModal').on('hidden.bs.modal', function() {
        $(this).find('form').trigger('reset');
        $(".error").next('label').remove();
        $(this).find('.error').removeClass('error');
        $(".js-subscribeResult").remove();
        $('#subscribe > .form-group').show();
    });

    $("#subscribe [type='submit']").on('click', function() {

        $("select option[hidden]").text("");
    });
       $('#formSubscribeModal input[type="text"], #formSubscribeModal input[type="email"]').focus(function() {
        $(this).next('label').remove();
    });


    $('#formSubscribeModal input[type="text"], #formSubscribeModal input[type="namefnln"]').focus(function() {
        $(this).next('label').remove();
    });


    $('input[type="email"]').on('blur', function(e) {
        if ($(this).next().hasClass('error')) {
            $(this).val('');
        }
    });
      $('input[type="namefnln"]').on('blur', function(e) {
        if ($(this).next().hasClass('error')) {
            $(this).val('');
        }
    });


    $('#formSubscribeModal select').on("keydown", function(e) {
        if(e.which==38 || e.which==40) {
                                           if ($(this).next().hasClass('error')) {
                $(this).next().html('');
            }
        }
    }); 
 });


/* Subscribe overlay validation - End */

/* SVG conversion Start */
/*
 * Replace all SVG images with inline SVG
 */
$(function() {
    $('.products-list img.img-responsive').each(function() {
        var $img = $(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
        $.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = $(data).find('svg');
            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }
            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');
            // Replace image with new SVG
            $img.replaceWith($svg);
        }, 'xml');
    });
});
/* SVG conversion End */
$(function() {
    $('.mobile-menubar-green img.mobile-menu').each(function() {
        var $img = $(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
        $.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = $(data).find('svg');
            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }
            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');
            // Replace image with new SVG
            $img.replaceWith($svg);
        }, 'xml');
    });
});

/* Board of Directors - page */
/* Code for 3 column structure in lg(Portrait and landscape), md(Portrait and landscape) and sm(landscape) devices. 2 column structure in sm(Portrait) and xs devices */
$(document).ready(function() {
	var boardMembers = $('.tile-img-block');

	var boardMembersIndex = 1;
	$.each(boardMembers, function( index, value ) {
	  if (boardMembersIndex % 2 == 0) {
		$(this).parent().after("<div class=\"clearfix visible-sm\"></div>");
	  }
	  if (boardMembersIndex % 3 == 0) {
		$(this).parent().after("<div class=\"clearfix visible-md visible-lg\"></div>");
	  }	  
	  boardMembersIndex++;
	});
});
/* Sustainable Supply Chains - page */
/* Code for 4 column carousel structure in lg(Portrait and landscape), md(Portrait and landscape) and sm(landscape) devices. 
   2 column structure in sm(Portrait) and 1 column structure in xs devices */
$(document).ready(function() {
    // responsive slick carousel
    var multiCarousel = $(".carousel");
    $(".four-tile-slider").not('.slick-initialized').slick({
      adaptiveHeight: true,
      dots: true,
      arrows: false,
      cssEase: "linear",
      speed: 0,
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [{
        breakpoint: 1024, // width < 1024
        settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        }, {
        breakpoint: 900, // width < 768
        settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }, {
        breakpoint: 768, // width < 768
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }, {
        breakpoint: 569, // max-width < 569
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }]
    });

    /* code to adjust slick carousel height and slick dots height */
    function adjustSlickHeight() {
      
      var currentHeight = $(".four-tile-slider .card-wrapper.news-cards").innerHeight();
      currentHeight = currentHeight + 35;
      $('.four-tile-slider').css({"height" : currentHeight+'px'});
      
     var IPAD = 676;
     var $win = $(window);

      if ($win.outerWidth() > IPAD) {
         $('#fourTileSustCarousel .slick-dots').css({"height" : '20px', "margin-bottom": "2px"});
      }
    }
    
    setTimeout(function(){
      adjustSlickHeight();
    }, 2000);

    $(window).on('resize orientationchange', function() {
      $('.four-tile-slider').slick('resize');
      adjustSlickHeight();
    });
});


/* Sustainable Supply Chains - page */
/* Code for 4 column carousel structure in lg(Portrait and landscape), md(Portrait and landscape) and sm(landscape) devices. 
   2 column structure in sm(Portrait) and 1 column structure in xs devices */
$(document).ready(function() {
    // slick carousel
    var multiCarousel = $(".carousel");
    $(".three-tile-slider").not('.slick-initialized').slick({
        adaptiveHeight: true,
        dots: true,
        arrows: false,
        speed: 0,
        cssEase: "linear",
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [{
            breakpoint: 1024, // width < 1024
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3
            }
        }, {
            breakpoint: 900, // width < 768
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 768, // width < 768
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }, {
            breakpoint: 569, // max-width < 569
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    });

    /* 
     *  code to adjust slick carousel height and slick dots height
     */
    function adjustSlickHeight() {
        var IPAD = 676;
        var $win = $(window);
        if ($win.outerWidth() > IPAD) {
            $('#fourTileSustCarousel .slick-dots').css({
                "height": '17px'
            });
            $('.js-kpi-carousel .slick-list').eq(1).css({
                "margin-bottom": "120px"
            });
        }
    }

    setTimeout(function() {
        adjustSlickHeight();
    }, 2000);

    $(window).on('resize orientationchange', function() {
        $('.three-tile-slider').slick('resize');
        adjustSlickHeight();
    });
});
$(document).ready(function() {

    /*
     * This function is used to adjust the carousel's parent container height & bottom space adjustment.
     *
     */
    function adjustParentHeight() {
        var DESKTOP_WIDTH = 1024;
        var $win = $(window);
        // Desktop view height adjustment
        if ($win.outerWidth() >= DESKTOP_WIDTH && $win.outerWidth() > $win.innerHeight()) {
            var titleCarouselObj = $(".js-eventcarousel");
            var parentCardHeight = "";
            var childCardHeight = "";
            $.each(titleCarouselObj, function(key, value) {
                var currentSlickCount = $(this).find(".slick-slide:not(.slick-cloned)").length;

                if (currentSlickCount > 1) {
                    var innerSlickObj = $(this).find(".slick-slide:not(.slick-cloned)");
                    parentCardHeight = $(this).outerHeight();
                    console.log("parentCardHeight : " + parentCardHeight);
                    var heightList = [];

                    // This iteration is used to get the all card height of carousel's
                    $.each(innerSlickObj, function(key, value) {
                        childCardHeight = $(this).find(".card-wrapper").outerHeight();
                        console.log("childCardHeight : " + childCardHeight);
                        if (parentCardHeight <= childCardHeight) {
                            var applyMarginBottom = childCardHeight - parentCardHeight;
                            console.log("applyMarginBottom : " + applyMarginBottom);
                            heightList.push(childCardHeight);
                        }
                    });
                    
                   // To find out the highest card height of carousel.
                    var maxHeight = Math.max.apply(Math, heightList);
                    console.log('Max Heigh : ' + maxHeight);
                    if (!isNaN(maxHeight)) {
						maxHeight = 0;
                    }
                    if (maxHeight > 0) {
                        $(this).find('div.slick-list > div.slick-track').css({
                            "height": maxHeight + 70
                        });
                        $(this).css({
                            "margin-bottom": 80
                        });
                    } else {
                        $(this).css({
                            "margin-bottom": 70
                        });
                    }
                } else {
                    var currentImageHeight = $(this).find(".events-image").outerHeight();
                    var currentCardHeight = $(this).find(".card-wrapper").outerHeight();
                    var cardTopPosition = $(".event-card").position();
                    console.log(cardTopPosition);
                    var currentCardPositionHeight = (currentCardHeight - (cardTopPosition.top * -1));
                    if (currentCardPositionHeight > currentImageHeight ) {
                        $(this).css({
                            "height": currentCardHeight
                        });
                    }
                    else
                    {
						$(this).css({
                            "height": currentImageHeight +(cardTopPosition.top * -1)
                        });
                    }
                }
            });
        } else {  // mobile view height adjustment
            var titleCarouselObj = $(".js-eventcarousel");
            $.each(titleCarouselObj, function(key, value) {
                var currentSlickCount = $(this).find(".slick-slide:not(.slick-cloned)").length;
                if (currentSlickCount > 1) {
                    if ($(this).not('[style]')) {
                        $(this).css({
                            "margin-bottom": 70
                        });
                    }
                }
            });
        }

    }

    setTimeout(function() {
        adjustParentHeight();
    }, 3000);

});
$(document).ready(function() {
	// code to control the height of card when content is more
    function adjustFullWidthImageCardHeight() {
		var fullImageCarouselObj = $(".js-full-width-image-card");
		$.each(fullImageCarouselObj, function(key, value) {
			var currentImageHeight = $(this).find("img.img-responsive").outerHeight();
			var currentCardHeight = $(this).find(".card.spruce-bar").height();
			if (currentCardHeight > currentImageHeight) {
				var cardCarouselHeight = currentCardHeight;
				$(this).css({"height" : cardCarouselHeight});
			}
		});

    } 
    if(window.innerWidth>768) {
    setTimeout(function(){ adjustFullWidthImageCardHeight(); }, 3000);
    }

function adjustFullWidthImageHeight() {

        var ribbon = $(".ribbon");
        var ribbonHeight = $(ribbon).height();
        var leadercard = $(".card").outerHeight();
    	if ($(".card-event").hasClass('full-width-pos-bot-right')  || $(".card-event").hasClass('full-width-pos-bot-left')){ 
        var cardPosition = $(".card-event").position();
        console.log(cardPosition.top);
        var ribbonCardHeight = (ribbonHeight + leadercard) - cardPosition.top;
        }
        $(ribbon).parent().parent().css({"height" : ribbonCardHeight + "px" });

}
adjustFullWidthImageHeight();

});

$(document).ready(function() {
	'use strict';
    /*
     * This event is using for accordion collapse & expand
     */
    $(".panel-heading").click(function(){
        var currentBoolean = $(this).next().is(':hidden');
        var accordion = $(".panel-heading");
        // Resetting all accordion to collapse state
        $.each(accordion, function(key, value) {
            $(this).next().hide();
            $(this).find(".accordion-toggle").addClass("collapsed");
        });
        if (currentBoolean) {
            $(this).next().show();
            $(this).find(".accordion-toggle").removeClass("collapsed");
        } else {
            $(this).next().hide();
            $(this).find(".accordion-toggle").addClass("collapsed");
        }
    });

});
$( document ).ready(function() {

$( ".digital-enabler-height:eq( 1 )" ).css( "margin-left", "110px" );
$( ".digital-enabler-height:eq( 3 )" ).css( "margin-left", "110px" );

});


$(function() {

	var customerNameLabel = $("#customerNameLabel").text();
    var organizationLabel = $("#organizationLabel").text();
    var descriptionLabel = $("#descriptionLabel").text();
    var evidenceLabel = $("#evidenceLabel").text();
    var emailLabel = $("#contact_Email").text();
    var mobileLabel = $("#contact_Mobile").text();
    var faxLabel = $("#contact_Fax").text();
    var laneLabel = $("#contact_Lane").text();
    var cityLabel = $("#contact_City").text();
    var countryLabel = $("#contact_Country").text();


	var spinner = $('#loader');

$.validator.addMethod(

    "regex",


    function(value, element, regexp)  {


        if (regexp && regexp.constructor != RegExp) {

           regexp = new RegExp(regexp);
        }


        else if (regexp.global) regexp.lastIndex = 0;
        return this.optional(element) || regexp.test(value);
    }
);
  $("form[name='grivanceForm']").validate({
    rules: {

    // customerName: "required",
      Email: {
        required: false,
        email: true,
        regex: /^\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i

      },


     Mobile: {
         required: false,
         digits: true,
        minlength: 10,
         maxlength: 15
      },
        description: {
        required: true,
        minlength: 4,
         maxlength: 200
      },
        checkbox: {
                 required : true
              }
    },

    messages: {
      //customerName: "Please enter your customerName",

      Mobile: {
        required: "This field is optional",
        minlength: "Your mobile number must be at least 10 characters long"
      },
        description: {
        required: "Please provide description",
        minlength: "Your description must be at least 4 characters long"

      },

      Email: {
                    required: "Email is optional",
                    email: "Enter Valid Email Address",
                },
        checkbox: {
            required : "Please agree to the privacy policy to proceed"
          }
    },
       submitHandler: function(form) {


        spinner.show();

        var data = {

            		nameLabel: customerNameLabel,
            		name: $('#customerName').val(),
            		organizationLabel: organizationLabel,
            		organization: $('#organization').val(),
            		emailLabel: emailLabel,
					email:$('#Email').val(),
            		mobileLabel: mobileLabel,
                    mobile:$('#Mobile').val(),
            		faxLabel: faxLabel,
               		fax:$('#Fax').val(),
            		laneLabel: laneLabel,
            		lane:$('#Lane').val(),
            		cityLabel: cityLabel,
            		city:$('#City').val(),
            		countryLabel: countryLabel,
              		country:$('#Country').val(),
            		descriptionLabel: descriptionLabel,
            		description: $('#description').val(),
            		evidenceLabel: evidenceLabel,
            		evidence: $('#evidence').val(),
           			agree: $("#agree").val(),
				};


           //var grievanceDetails = JSON.stringify(data);



					$.ajax({
						url: "/bin/grievance",
						type: "post",
						data: data,
						
						cache: false,

							success: function (response) {
//alert("success");

                                swal(
        "Success!",
       "Thank you for your submission. By clicking OK you will be redirected to the homepage.",
        "success"
      )



							console.log("trest1", response);

							document.getElementById('grivance').reset();
							spinner.hide();

							
						},

						error: function (response) {
                            //alert("errorrr");
                            swal(
          "Internal Error",
          "The form could not be submitted. Please try again in some time",
          "error"
        )
							console.log(response);
							document.getElementById('grivance').reset();

                            spinner.hide();
							
						}


					});

		 },


  });

});



/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.1
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */


;(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: window.autoplay ? true : false,
                autoplaySpeed: 4000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: false,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function() {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function() {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if ( asNavFor && asNavFor !== null ) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function(index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if ( asNavFor !== null && typeof asNavFor === 'object' ) {
            asNavFor.each(function() {
                var target = $(this).slick('getSlick');
                if(!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        _.autoPlayClear();

        if ( _.slideCount > _.options.slidesToShow ) {
            _.autoPlayTimer = setInterval( _.autoPlayIterator, _.options.autoplaySpeed );
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if ( !_.paused && !_.interrupted && !_.focussed ) {

            if ( _.options.infinite === false ) {

                if ( _.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {
                    _.direction = 0;
                }

                else if ( _.direction === 0 ) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if ( _.currentSlide - 1 === 0 ) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler( slideTo );

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true ) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if( _.slideCount > _.options.slidesToShow ) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add( _.$nextArrow )

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides =
            _.$slider
                .children( _.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function() {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides,slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if(_.options.rows > 0) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for(a = 0; a < numOfSlides; a++){
                var slide = document.createElement('div');
                for(b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for(c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width':(100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function(initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if ( _.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if( !initial && triggerBreakpoint !== false ) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function(event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if(!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function(index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function() {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

            if (_.options.accessibility === true) {
                _.$dots.off('keydown.slick', _.keyHandler);
            }
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
                _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
            }
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function() {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function() {

        var _ = this, originalSlides;

        if(_.options.rows > 0) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function(event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function(refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if ( _.$prevArrow && _.$prevArrow.length ) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.prevArrow )) {
                _.$prevArrow.remove();
            }
        }

        if ( _.$nextArrow && _.$nextArrow.length ) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.nextArrow )) {
                _.$nextArrow.remove();
            }
        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function(){
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if(!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function(slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function() {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick', '*', function(event) {

            event.stopImmediatePropagation();
            var $sf = $(this);

            setTimeout(function() {

                if( _.options.pauseOnFocus ) {
                    _.focussed = $sf.is(':focus');
                    _.autoPlay();
                }

            }, 0);

        });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            if (_.slideCount <= _.options.slidesToShow) {
                 ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if(!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        }else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide,
            coef;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                coef = -1

                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2
                    }
                }
                verticalOffset = (verticalHeight * _.options.slidesToShow) * coef;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = ((_.slideWidth * Math.floor(_.options.slidesToShow)) / 2) - ((_.slideWidth * _.slideCount) / 2);
        } else if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft =  0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft =  0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function() {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function() {

        return this;

    };

    Slick.prototype.getSlideCount = function() {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function(index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function(creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if ( _.options.autoplay ) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function() {
        var _ = this,
                numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
                tabControlIndexes = _.getNavigableIndexes().filter(function(val) {
                    return (val >= 0) && (val < _.slideCount);
                });

        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function(i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);

                $(this).attr({
                    'role': 'tabpanel',
                    'id': 'slick-slide' + _.instanceUid + i,
                    'tabindex': -1
                });

                if (slideControlIndex !== -1) {
                   var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex
                   if ($('#' + ariaButtonControl).length) {
                     $(this).attr({
                         'aria-describedby': ariaButtonControl
                     });
                   }
                }
            });

            _.$dots.attr('role', 'tablist').find('li').each(function(i) {
                var mappedSlideIndex = tabControlIndexes[i];

                $(this).attr({
                    'role': 'presentation'
                });

                $(this).find('button').first().attr({
                    'role': 'tab',
                    'id': 'slick-slide-control' + _.instanceUid + i,
                    'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
                    'aria-label': (i + 1) + ' of ' + numDotGroups,
                    'aria-selected': null,
                    'tabindex': '-1'
                });

            }).eq(_.currentSlide).find('button').attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).end();
        }

        for (var i=_.currentSlide, max=i+_.options.slidesToShow; i < max; i++) {
          if (_.options.focusOnChange) {
            _.$slides.eq(i).attr({'tabindex': '0'});
          } else {
            _.$slides.eq(i).removeAttr('tabindex');
          }
        }

        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'previous'
               }, _.changeSlide);
            _.$nextArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'next'
               }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow.on('keydown.slick', _.keyHandler);
                _.$nextArrow.on('keydown.slick', _.keyHandler);
            }
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$dots.on('keydown.slick', _.keyHandler);
            }
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function() {

        var _ = this;

        if ( _.options.pauseOnHover ) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(_.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;
         //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if(!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' :  'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function() {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageSrcSet = $(this).attr('data-srcset'),
                    imageSizes  = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function() {

                    image
                        .animate({ opacity: 0 }, 100, function() {

                            if (imageSrcSet) {
                                image
                                    .attr('srcset', imageSrcSet );

                                if (imageSizes) {
                                    image
                                        .attr('sizes', imageSizes );
                                }
                            }

                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function() {
                                    image
                                        .removeAttr('data-lazy data-srcset data-sizes')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function() {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

        if (_.options.lazyLoad === 'anticipated') {
            var prevSlide = rangeStart - 1,
                nextSlide = rangeEnd,
                $slides = _.$slider.find('.slick-slide');

            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }

        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function() {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function() {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function() {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if( !_.unslicked ) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }

            _.swipeLeft = null;

            if ( _.options.autoplay ) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();

                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr('tabindex', 0).focus();
                }
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function(event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function( tryCount ) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $( 'img[data-lazy]', _.$slider ),
            image,
            imageSource,
            imageSrcSet,
            imageSizes,
            imageToLoad;

        if ( $imgsToLoad.length ) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageSrcSet = image.attr('data-srcset');
            imageSizes  = image.attr('data-sizes') || _.$slider.attr('data-sizes');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function() {

                if (imageSrcSet) {
                    image
                        .attr('srcset', imageSrcSet );

                    if (imageSizes) {
                        image
                            .attr('sizes', imageSizes );
                    }
                }

                image
                    .attr( 'src', imageSource )
                    .removeAttr('data-lazy data-srcset data-sizes')
                    .removeClass('slick-loading');

                if ( _.options.adaptiveHeight === true ) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [ _, image, imageSource ]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function() {

                if ( tryCount < 3 ) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout( function() {
                        _.progressiveLazyLoad( tryCount + 1 );
                    }, 500 );

                } else {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [ _ ]);

        }

    };

    Slick.prototype.refresh = function( initializing ) {

        var _ = this, currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if( !_.options.infinite && ( _.currentSlide > lastVisibleIndex )) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if ( _.slideCount <= _.options.slidesToShow ) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if( !initializing ) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function() {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ( $.type(responsiveSettings) === 'array' && responsiveSettings.length ) {

            _.respondTo = _.options.respondTo || 'window';

            for ( breakpoint in responsiveSettings ) {

                l = _.breakpoints.length-1;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while( l >= 0 ) {
                        if( _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint ) {
                            _.breakpoints.splice(l,1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function(a, b) {
                return ( _.options.mobileFirst ) ? a-b : b-a;
            });

        }

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function() {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function() {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if( !_.unslicked ) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function() {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
    Slick.prototype.slickSetOption = function() {

        /**
         * accepts arguments in format of:
         *
         *  - for changing a single option's value:
         *     .slick("setOption", option, value, refresh )
         *
         *  - for changing a set of responsive options:
         *     .slick("setOption", 'responsive', [{}, ...], refresh )
         *
         *  - for updating multiple values at once (not responsive)
         *     .slick("setOption", { 'option': value, ... }, refresh )
         */

        var _ = this, l, item, option, value, refresh = false, type;

        if( $.type( arguments[0] ) === 'object' ) {

            option =  arguments[0];
            refresh = arguments[1];
            type = 'multiple';

        } else if ( $.type( arguments[0] ) === 'string' ) {

            option =  arguments[0];
            value = arguments[1];
            refresh = arguments[2];

            if ( arguments[0] === 'responsive' && $.type( arguments[1] ) === 'array' ) {

                type = 'responsive';

            } else if ( typeof arguments[1] !== 'undefined' ) {

                type = 'single';

            }

        }

        if ( type === 'single' ) {

            _.options[option] = value;


        } else if ( type === 'multiple' ) {

            $.each( option , function( opt, val ) {

                _.options[opt] = val;

            });


        } else if ( type === 'responsive' ) {

            for ( item in value ) {

                if( $.type( _.options.responsive ) !== 'array' ) {

                    _.options.responsive = [ value[item] ];

                } else {

                    l = _.options.responsive.length-1;

                    // loop through the responsive object and splice out duplicates.
                    while( l >= 0 ) {

                        if( _.options.responsive[l].breakpoint === value[item].breakpoint ) {

                            _.options.responsive.splice(l,1);

                        }

                        l--;

                    }

                    _.options.responsive.push( value[item] );

                }

            }

        }

        if ( refresh ) {

            _.unload();
            _.reinit();

        }

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if ( _.options.fade ) {
            if ( typeof _.options.zIndex === 'number' ) {
                if( _.options.zIndex < 3 ) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                    _.$slides
                        .slice(index - centerOffset + evenCoef, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                        infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount  + _.slideCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function( toggle ) {

        var _ = this;

        if( !toggle ) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.slideHandler(index, false, true);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this, navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if ( _.options.autoplay ) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if ( _.options.asNavFor ) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if ( navTarget.slideCount <= navTarget.options.slidesToShow ) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function() {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
            _.animateSlide(targetLeft, function() {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.swiping = false;

        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }

        _.interrupted = false;
        _.shouldClick = ( _.touchObject.swipeLength > 10 ) ? false : true;

        if ( _.touchObject.curX === undefined ) {
            return false;
        }

        if ( _.touchObject.edgeHit === true ) {
            _.$slider.trigger('edge', [_, _.swipeDirection() ]);
        }

        if ( _.touchObject.swipeLength >= _.touchObject.minSwipe ) {

            direction = _.swipeDirection();

            switch ( direction ) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide + _.getSlideCount() ) :
                            _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide - _.getSlideCount() ) :
                            _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if( direction != 'vertical' ) {

                _.slideHandler( slideCount );
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction ]);

            }

        } else {

            if ( _.touchObject.startX !== _.touchObject.curX ) {

                _.slideHandler( _.currentSlide );
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        verticalSwipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }

        swipeDirection = _.swipeDirection();

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function(fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function() {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if ( _.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite ) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                    .removeClass('slick-active')
                    .end();

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active');

        }

    };

    Slick.prototype.visibility = function() {

        var _ = this;

        if ( _.options.autoplay ) {

            if ( document[_.hidden] ) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

(function() {
    "use strict";

    window.CQ = window.CQ || {};
    window.CQ.CoreComponents = window.CQ.CoreComponents || {};
    window.CQ.CoreComponents.container = window.CQ.CoreComponents.container || {};
    window.CQ.CoreComponents.container.utils = {};

    /**
     * Utilities for Container Components (accordion, tabs)
     *
     * @namespace
     * @alias CQ.CoreComponents.container.utils
     * @type {{}}
     */
    CQ.CoreComponents.container.utils = {

        /**
         * Returns index of the container component item (accordion, tabs) that corresponds to the deep link in the URL fragment.
         *
         * @param {Object} component The Accordion or Tabs component.
         * @param {String} itemType The type of the item as defined in the component.
         * @returns {Number} the index within the items array if the item exists, -1 otherwise.
         */
        getDeepLinkItemIdx: function(component, itemType) {
            if (window.location.hash) {
                var deepLinkId = window.location.hash.substring(1);
                if (document.getElementById(deepLinkId) &&
                    deepLinkId && component &&
                    component._config && component._config.element && component._config.element.id &&
                    component._elements && component._elements[itemType] &&
                    deepLinkId.indexOf(component._config.element.id + "-item-") === 0) {
                    for (var i = 0; i < component._elements[itemType].length; i++) {
                        var item = component._elements[itemType][i];
                        if (item.id === deepLinkId) {
                            return i;
                        }
                    }
                }
                return -1;
            }
        },

        /**
         * Returns the item of the container component (accordion, tabs) that corresponds to the deep link in the URL fragment.
         *
         * @param {Object} component The Accordion or Tabs component.
         * @param {String} itemType The type of the item as defined in the component.
         * @returns {Object} the item if it exists, undefined otherwise.
         */
        getDeepLinkItem: function(component, itemType) {
            var idx = CQ.CoreComponents.container.utils.getDeepLinkItemIdx(component, itemType);
            if (component && component._elements && component._elements[itemType]) {
                return component._elements[itemType][idx];
            }
        }

    };
}());
