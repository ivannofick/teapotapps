import { render } from "../core/http.js";
import { responseApi } from "../libs/RestApiHandler.js";

export const wellcome = async (req, res) => {
  return await render(res, 'Wellcome', { name: 'Ivannofick' });
};

export const apiWellcome = async (req, res) => {
  return responseApi(res, { 'users': 1 }, { "saya": 1 }, "Users fetched successfully");
};

