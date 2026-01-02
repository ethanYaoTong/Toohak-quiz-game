// Do not delete this file
type ErrorMsg = {
  error: string;
  message: string;
};

function echo(value: string): { value: string } | ErrorMsg {
  if (value === 'echo') {
    return {
      error: 'INVALID_ECHO',
      message: 'You cannot echo the word echo itself',
    };
  }

  return {
    value,
  };
}

export { echo };
