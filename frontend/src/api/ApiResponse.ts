type ApiResponse<Type> =
  | {
      success: true;
      status: number;
      data?: Type;
    }
  | {
      success: false;
      status: number;
      error: string;
    };

export default ApiResponse;
