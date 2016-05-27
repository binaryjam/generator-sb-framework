/* global _spPageContextInfo */
/* global ko */
/* global $ */

// If the token times out there is how to fix it here
//http://www.wictorwilen.se/sharepoint-2013-how-to-refresh-the-request-digest-value-in-javascript

var EON = EON || {};
EON.Timeline = EON.Timeline || {};

(function (ns) {

    var timelineModel;
    var startDate = moment("2016-01-01");
    var options;
    var timelineBlocks;

    function init(opts) {

        var _defaults = {}

        options = $.extend({}, _defaults, opts);

        timelineModel = new TimeLineModel();
        ko.applyBindings(timelineModel);

        $(".nav-toggle").click(function () {
            $(".nav-main").slideToggle("400", function () {
                $(this).css("overflow", "");
            });
            $(this).toggleClass('menu-is-active');
        });

        fetchTimeLineContent();

    }


    function TimeLineModel() {
        var self = this;

        self.timelineItems = ko.observableArray([]);
        //self.debug = true;
        self.template = function (row) {
            return row.itemType;
        };
        self.dayRanges = ko.observableArray([]);
        self.selectedRange = ko.observable();
        self.selectedRangeText = ko.computed(function () { if (self.selectedRange()) { return self.selectedRange().text } }, self)
        self.selectRange = function (rangeItem) {
            self.selectedRange(rangeItem);
            return false;
        };

        self.renderedHandler = function () {
            timelineBlocks = $('.cd-timeline-block'), offset = 0.8;

            //hide timeline blocks which are outside the viewport
            hideBlocks(timelineBlocks, offset);
          
            $('.mediaPlayerContainer:first-child').each(function(){
                var player=this;
                
            })
          
        }

        self.filteredTimeLine = ko.computed(function () { return filterTimeLine(self.timelineItems, self.selectedRange()) }, self);
    }

    function filterTimeLine(items, selectedRange) {
        if (!selectedRange) {
            return items;
        }
        else {
            return ko.utils.arrayFilter(items(), function (item) {
                return item.days > (selectedRange.value - 99) && item.days <= selectedRange.value;
            });
        }
    }

    function fetchTimeLineContent() {
        //I am using SP services because the REST API will not return media object data in the main fetch, so why
        //use it or JSOM which would execute multiple requests instead of one.
        $().SPServices({
            operation: "GetListItems",
            async: true,
            listName: "Stream",
            CAMLRowLimit: 0,
            CAMLQuery: "<Query><OrderBy><FieldRef Name='Days' Ascending='true' /></OrderBy></Query>",
            CAMLViewFields: "<ViewFields><FieldRef Name='Title' /> \
                                    <FieldRef Name='ItemType' /> \
                                    <FieldRef Name='Story' /> \
                                    <FieldRef Name='StoryPopup' /> \
                                    <FieldRef Name='Header' /> \
                                    <FieldRef Name='Quote' /> \
                                    <FieldRef Name='QuotePerson' /> \
                                    <FieldRef Name='Video' /> \
                                    <FieldRef Name='TimelineDate' /> \
                                    <FieldRef Name='Days' /> \
                                    <FieldRef Name='TitleUrl' /> \
                                    <FieldRef Name='ReadMoreUrl' /> \
                                </ViewFields>",
            completefunc: function (xData, Status) {

                $(xData.responseXML).SPFilterNode("z:row").map(function () {
                    var $xmlMedia = $($.parseXML($(this).attr('ows_Video'))).children();
                    var titleUrl = "";
                    var media = { previewImageSource: "", source: "", ishtml5:true };

                    $xmlMedia.children('dt').each(function (index) {
                        switch ($(this).text()) {
                            case "PreviewImageSource":
                                media.previewImageSource = $xmlMedia.children('dd').eq(index).children('A').attr('href');
                                if (media.previewImageSource.toLowerCase().indexOf("videopreview.png") !== -1) {
                                    media.previewImageSource = "";
                                }
                                break;
                            case "MediaSource":
                                media.source = $xmlMedia.children('dd').eq(index).children('A').attr('href');
                                
                                 var ext = media.source.substr(media.source.lastIndexOf('.') + 1);
                                switch(ext){
                                    case "wmv":
                                        media.ishtml5= false;
                                        break;
                                    default:
                                        media.ishtml5= true;
                                        break;
                                }
                                break;
                            case "InlineHeight":
                                media.height = $xmlMedia.children('dd').eq(index).text();
                            case "InlineWidth":
                                media.width = $xmlMedia.children('dd').eq(index).text();
                            default:
                                break;
                        }
                    });

                    var titleUrl = $(this).attr('ows_TitleUrl');
                    if (typeof titleUrl === 'undefined') {
                        titleUrl = "";
                    }
                    else {
                        titleUrl = titleUrl.split(",")[0];
                    }

                    var readMoreUrl = $(this).attr('ows_ReadMoreUrl');
                    if (typeof readMoreUrl === 'undefined') {
                        readMoreUrl = "";
                    }
                    else {
                        readMoreUrl = readMoreUrl.split(",")[0];
                    }

                    var story = $(this).attr('ows_Story');
                    if (typeof story === 'undefined') {
                        story = "";
                    }

                    var timelineDate = moment($(this).attr('ows_TimelineDate'));
                   // var diffDay = moment($(this).attr('ows_TimelineDate')).add(1, 'd');
                    //var days = moment.duration(diffDay.diff(startDate)).asDays();
                    //days = Math.floor(days);
                    
                    var days=parseInt($(this).attr('ows_Days'),10);

                    timelineModel.timelineItems.push({
                        id: $(this).attr('ows_ID'),
                        itemType: $(this).attr('ows_ItemType'),
                        title: $(this).attr('ows_Title'),
                        titleUrl: titleUrl,
                        readMoreUrl: readMoreUrl,
                        story: story,
                        storyPopupHeader: $(this).attr('ows_StoryPopupHeader'),
                        storyPopup: $(this).attr('ows_StoryPopup'),
                        quote: $(this).attr('ows_Quote'),
                        quotePerson: $(this).attr('ows_QuotePerson'),
                        media: media,
                        days: days,
                        timeLineDate: timelineDate.format("dddd, MMMM Do YYYY")

                    });


                });

                if (timelineModel.timelineItems().length > 0) {
                    //Calculate Max DayRanges  ad push into timelineModel.dayRanges
                    var maxDays = timelineModel.timelineItems()[timelineModel.timelineItems().length - 1].days;
                    maxDays = (maxDays > 500) ? 500 : maxDays;
                    var loopCount = Math.floor(maxDays / 100);
                    for (var i = 1; i <= loopCount + 1; i++) {
                        timelineModel.dayRanges.push({
                            text: "Day " + (i * 100 - 99) + " - " + (i * 100),
                            value: i * 100
                        });
                    }
                }
                else {
                    timelineModel.dayRanges.push({
                        text: "Day 1 - 100",
                        value: 100
                    });
                }
                timelineModel.selectedRange(timelineModel.dayRanges()[0]);

                $("a[rel*=leanModal]").leanModal({ top: 100 });
                timelineBlocks = $('.cd-timeline-block'), offset = 0.8;

                //hide timeline blocks which are outside the viewport
                hideBlocks(timelineBlocks, offset);

                //on scolling, show/animate timeline blocks when enter the viewport
                $(window).on('scroll', function () {
                    (!window.requestAnimationFrame)
                        ? setTimeout(function () { showBlocks(timelineBlocks, offset); }, 100)
                        : window.requestAnimationFrame(function () { showBlocks(timelineBlocks, offset); });
                });
            }
        });

    }

    //Utility functions
    function hideBlocks(blocks, offset) {
        blocks.each(function () {
            ($(this).offset().top > $(window).scrollTop() + $(window).height() * offset) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
        });
    }

    function showBlocks(blocks, offset) {
        blocks.each(function () {
            ($(this).offset().top <= $(window).scrollTop() + $(window).height() * offset && $(this).find('.cd-timeline-img').hasClass('is-hidden')) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
        });
    }
    //end Utility functions


    ns.init = init;

} (EON.Timeline));


$(function () {
    EON.Timeline.init();
});

