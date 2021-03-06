// npm
import React, { Component } from 'react'

// components
import Event from './event.jsx'

const styles = {
  eventListUl: {
    position: 'relative',
    float: 'left',
    display: 'block',
    width: 620,
    height: 720,
    marginTop: 23,
    paddingRight: 10,
    paddingLeft: 10,
    backgroundColor: '#454b5a',
    listStyle: 'none',
  },
}

// Algorythmics
///////////////

// see $PROJECT_ROOT/algorythmics.js for original draft of algorythm
//                           + more comments
//                           + adhoc functional test
//                           + more messy

/**
 * Determine if two events overlap
 * 
 * @param {object} - eventA first event to compare for overlaps
 * @param {object} - eventB second event to compare for overlaps
 * 
 * @return {boolean} - Truthiness of overlapping quality for two events
 * 
 */
const isOverlapping = (eventA, eventB) => {
  // A starts before B ends and A ends after B starts
  return eventA.start < eventB.end && eventA.end > eventB.start
}

/**
 * Generate list of all events that overlap a given event
 * 
 * @param {array} - events collection of events to operate on
 * @param {object} - event event to compare all others against
 * @param {number} - index the index of the event in events
 * 
 * @return {array} - array of overlapping indices
 * 
 */
const reduceOverlaps = (events, event, index) => {
  return events.reduce((collidingEvents, reduceEvent, reduceIndex) => {
    //short circuit for same event
    if (reduceIndex === index) {
      return collidingEvents
    }
    //if
    return (isOverlapping(event, reduceEvent))
      //then
      ? collidingEvents.concat(reduceIndex)
      //else
      : collidingEvents
  }, [])
}

/**
 * The events with overlapping events for each event
 * 
 * @param {array} - events collection of events to operate on
 * 
 * @return {array} - collection of events with overlapping indices appended
 * 
 */
const collectOverlaps = (events) => {
  return events.map((event, index) => {
    return reduceOverlaps(events, event, index)
  })
}

/**
 * Count of concurrent events for a given set of overlapping indices
 * 
 * @param {array} - overlapIndices list of indices overlapping an event
 * @param {array} - allOverlaps list of list of overlaps for all events
 * @param {number} - index the index of the event in events
 * 
 * @return {number} - the number of concurrent events for a given event
 *                    meaning there are more than one events overlapping
 *                    eachother and the original event
 * 
 */
const countConcurrentEvents = (overlapIndices, allOverlaps, curIndex) => {
  return overlapIndices.reduce((accum, index) => {
    //if
    return _.intersection(allOverlaps[index], allOverlaps[curIndex]).length > 0
      //then
      ? accum.concat(index)
      //else
      : accum
  }, []).length
}

/**
 * Marshall three types of event overlaps to number of events spanning width
 * 
 * @param {array} - overlapIndices list of indices of overlapping events
 * @param {number} - concurrentEventCount number of concurrent events
 * 
 * @return {number} - number of spans to split set of events into
 * 
 */
const calcDenominator = (overlapIndices, concurrentEventCount) => {
  // default for no overlaps
  let denominator = 1
  // if we find overlaps and concurrent events
  if (overlapIndices.length && concurrentEventCount) {
    denominator = concurrentEventCount + 1
  // if we find overlaps but no concurrent events
  } else if (overlapIndices.length && !concurrentEventCount) {
    denominator = 2
  }
  return denominator
}

/**
 * Prepare props for render of events
 * 
 * @param {array} - events collection of events to render
 * @param {array} - overlaps events with overlapping indices appended
 * 
 * @return {array} - array of props needed to render list of events
 * 
 */
const prepProps = (events, overlaps) => {
  let counter = 0
  return overlaps.map((overlapIndices, index) => {
    // use concurrentEventCount to calculate number of other events also
    // colliding with a collided event
    let concurrentEventCount = overlapIndices
      ? countConcurrentEvents(overlapIndices, overlaps, index)
      : 0
    
    // use denominator to keep track of how many concurrentEvents there are
    const denominator = calcDenominator(overlapIndices, concurrentEventCount)

    let xFactor = counter % denominator
    counter++
    if (counter === denominator) counter = 0
    
    return {
      start: events[index].start,
      end: events[index].end,
      denominator: denominator,
      xFactor: xFactor,
    }
  })
}

const preppedProps = (events) => {
  const overlaps = collectOverlaps(events)
  
  return prepProps(events, overlaps)
}

// End Algorythmics
///////////////////

class EventList extends Component {

  render () {
    const { eventListUl } = styles
    const { width } = eventListUl
    const { events } = this.props

    return (
      <ul style={eventListUl}>
        {preppedProps(events).map((eventProps, index) => <Event
          ulWidth={width}
          key={index}
          index={index}
          {...eventProps}
        />)}
      </ul>
    )
  }

}

export default EventList