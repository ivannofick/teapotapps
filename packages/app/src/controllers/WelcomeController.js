import { controller, render } from "../core/http.js";

const wellcome = async (req, res) => {
  return await render('Wellcome', { name: 'Ivannofick' });
};

const apiWellcome = async (req, res) => {
  return {
    data: { 'users': 1 },
    meta: { "saya": 1 },
    status: {
      code: 0,
      message_client: "Users fetched successfully",
    },
  };
};

export default controller({ wellcome, apiWellcome });
