/**
 * Event System Test
 * 
 * This script tests the event system functionality.
 */

import { getEventService } from '../services/events/eventService';
import { EventType, EventPriority } from '../types/events/events';

/**
 * Run the event system test
 */
async function runEventSystemTest() {
  console.log('Starting Event System Test...');
  
  // Initialize the event service
  const eventService = getEventService();
  await eventService.initialize(true, 'development');
  
  console.log('Event service initialized');
  
  // Test event subscription
  console.log('Testing event subscription...');
  
  const subscription = eventService.on(
    EventType.SYSTEM,
    (event) => {
      console.log('Received system event:', event);
    },
    EventPriority.HIGH,
    'TestService'
  );
  
  console.log('Subscribed to system events with ID:', subscription.id);
  
  // Test event emission
  console.log('Testing event emission...');
  
  eventService.emit({
    type: EventType.SYSTEM,
    timestamp: Date.now(),
    source: 'EventSystemTest',
    priority: EventPriority.HIGH,
    data: {
      message: 'Test system event'
    }
  });
  
  // Test error event
  console.log('Testing error event...');
  
  eventService.emitError(
    'EventSystemTest',
    'Test error message',
    new Error('Test error')
  );
  
  // Test warning event
  console.log('Testing warning event...');
  
  eventService.emitWarning(
    'EventSystemTest',
    'Test warning message',
    { details: 'Additional warning details' }
  );
  
  // Test event history
  console.log('Testing event history...');
  
  const history = eventService.getEventHistory();
  console.log(`Event history contains ${history.length} events`);
  
  // Test service unsubscription
  console.log('Testing service unsubscription...');
  
  const unsubscribedCount = eventService.unsubscribeService('TestService');
  console.log(`Unsubscribed ${unsubscribedCount} listeners for TestService`);
  
  // Test auto-purge
  console.log('Testing auto-purge...');
  
  eventService.setAutoPurgeInterval(5000); // 5 seconds
  console.log('Auto-purge interval set to 5 seconds');
  
  // Test history limit
  console.log('Testing history limit...');
  
  eventService.setHistoryLimit(500);
  console.log('History limit set to 500 events');
  
  // Test logging modes
  console.log('Testing logging modes...');
  
  eventService.setLoggingMode('verbose');
  console.log('Logging mode set to verbose');
  
  // Emit a few more events
  for (let i = 0; i < 5; i++) {
    eventService.emit({
      type: EventType.SYSTEM,
      timestamp: Date.now(),
      source: 'EventSystemTest',
      data: {
        iteration: i,
        message: `Test event ${i}`
      }
    });
  }
  
  // Pause auto-purge
  console.log('Pausing auto-purge...');
  eventService.pauseAutoPurge();
  
  // Resume auto-purge
  console.log('Resuming auto-purge...');
  eventService.resumeAutoPurge();
  
  console.log('Event System Test completed successfully!');
}

// Run the test
runEventSystemTest().catch(error => {
  console.error('Error running event system test:', error);
});
