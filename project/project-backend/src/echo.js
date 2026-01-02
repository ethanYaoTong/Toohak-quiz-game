// Do not delete this file before iteration 3
function echo(value) {
  if (value.echo && value.echo === 'echo') {
    // Return a descriptive error message for easy debugging
    return { error: 'INVALID_ECHO', message: 'Cannot echo an object with the property \'echo\'.' };
  }
  return value;
}

export { echo };
