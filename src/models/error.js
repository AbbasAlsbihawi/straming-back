// class DatabaseError extends Error {
//   constructor(prismaError) {
//     super(prismaError.message);
//     this.code = prismaError.code;
//     this.details = prismaError.meta;
//   }

//   isClientError() {
//     return this.code.startsWith("P2");
//   }
// }

// export default DatabaseError;


class DatabaseError extends Error {
  constructor(prismaError) {
    super(prismaError.message);

    // Ensure that Error.captureStackTrace is available (it's not available in all environments)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }

    this.name = 'DatabaseError'; // Set the error name to the class name
    this.code = prismaError.code;

    // Check if 'meta' exists in the Prisma error object
    this.details = prismaError.meta ? prismaError.meta : {};

    // Alternatively, if you're sure 'meta' always exists, you can simplify it to
    // this.details = prismaError.meta;
  }

  isClientError() {
    // Safely check if code exists and is a string before calling startsWith
    return this.code && typeof this.code === 'string' && this.code.startsWith("P2");
  }
}

export default DatabaseError;
