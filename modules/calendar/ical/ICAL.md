# ICAL / ICS Syntax

## References
Defined in [RFC5545](https://datatracker.ietf.org/doc/html/rfc5545)   
Nice to read on https://www.kanzaki.com/docs/ical/

## Basics
Allways start file with `BEGIN:VCALENDAR` and end with `END:VCALENDAR`    
Events allways start with `BEGIN:VEVENT` and end with `END:VEVENT` and are nested in `VCALENDAR`    
Timezones are mandatory for recurring events and recommended for all events.    

## Interesting datatypes

### Datetime
```shell
YYYYMMDDTHHMMSS[Z]

#Examples
DTSTART:19970714T133000                     #Local time
DTSTART:19970714T173000Z                    #UTC time
DTSTART;TZID=Europe/Berlin:19970714T133000  #Local time and time zone reference
```

### Duration
```shell
  dur-value  = (["+"] / "-") "P" (dur-date / dur-time / dur-week)

  dur-date   = dur-day [dur-time]
  dur-time   = "T" (dur-hour / dur-minute / dur-second)
  dur-week   = DIGIT "W"
  dur-hour   = DIGIT "H" [dur-minute]
  dur-minute = DIGIT "M" [dur-second]
  dur-second = DIGIT "S"
  dur-day    = DIGIT "D"

  #Examples
  P15DT5H0M20S #A duration of 15 days, 5 hours and 20 seconds
  P7W #A duration of 7 weeks
  -P7W #A duration of -7 weeks
```

## Example with Timezone and Alarms

```shell
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mozilla.org/NONSGML Mozilla Calendar V1.1//EN #PRODID:-//<organisation>/NONSGML <application and/or version>//<country-code>


BEGIN:VTIMEZONE
TZID:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10
END:STANDARD
END:VTIMEZONE



BEGIN:VEVENT

UID:unique_id@stubegru.org #This property defines the persistent, globally unique identifier for the calendar component.
DTSTART;TZID=Europe/Berlin:20191204T120000 #Start time of the event, timezone CAN be used
DTEND;TZID=Europe/Berlin:20191204T154500 #End time of the event, timezone CAN be used

SUMMARY:Hiwi Sitzung #This property defines a short summary or subject for the calendar component.
DESCRIPTION:A very important meetng by all important people. #This property provides a more complete description of the calendar component, than that provided by the "SUMMARY" property.

DTSTAMP:20190401T125230Z #The property indicates the date/time that the instance of the iCalendar object was created. Must be in UTC
CREATED:20180913T081139Z # This property specifies the date and time that the calendar information was created by the calendar user agent in the calendar store. Note: This is analogous to the creation date and time for a file in the file system. Must be in UTC
LAST-MODIFIED:20180913T081140Z #Must be UTC

STATUS:CONFIRMED #TENTATIVE, CONFIRMED or CANCELLED
LOCATION:Town Hall #Location of the event
SEQUENCE:0 #This property defines the revision sequence number of the calendar component within a sequence of revisions. Should be incremented on changing event's properties

BEGIN:VALARM
ACTION:DISPLAY #"AUDIO" / "DISPLAY" / "EMAIL" / "PROCEDURE"
TRIGGER;VALUE=DURATION:-PT30M #relative to the events time (TRIGGER;VALUE=DURATION:-PT30M) or absolute (TRIGGER;VALUE=DATE-TIME:19980101T050000Z)
DESCRIPTION:This is an event reminder #description of the alarm
END:VALARM

END:VEVENT


BEGIN:VEVENT
#Another Event...
END:VEVENT

END:VCALENDAR
```