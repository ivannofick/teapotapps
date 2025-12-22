import { render } from "../core/http.js";

export const wellcome = async (req, res) => {
  return await render(res, 'Wellcome', { name: 'Ivannofick' });
};

export const apiWellcome = async (req, res) => {
  return {
    data: { 'users': 1 },
    meta: { "saya": 1 },
    status: {
      code: 0,
      message_client: "Users fetched successfully",
    },
  };
};

