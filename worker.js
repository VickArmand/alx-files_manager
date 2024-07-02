import Queue from 'bull';
// import img from 'image-thumbnail';

const fileQueue = new Queue('video transcoding', 'redis://127.0.0.1:6379');
fileQueue((job, done) => {
  // transcode image asynchronously and report progress
  job.progress(42);

  // call done when finished
  done();

  // or give an error if error
  done(new Error('error transcoding'));
  // img().
  // or pass it a result
  done(null, { width: 500 /* etc... */ });
  done(null, { width: 250 /* etc... */ });
  done(null, { width: 100 /* etc... */ });

  // If the job throws an unhandled exception it is also handled correctly
  throw new Error('some unexpected error');
});
