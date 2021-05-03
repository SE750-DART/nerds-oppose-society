type ApiResponse<Type> =
  | {
      success: true;
      data?: Type;
    }
  | {
      success: false;
      error: string;
    };

export default ApiResponse;
