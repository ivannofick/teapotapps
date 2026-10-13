import { render, responseApi } from "teapotapps";

export const wellcome = async (req, res) => {
  return await render(res, 'Wellcome', { name: 'Ivannofick' });
};

export const apiWellcome = async (req, res) => {
  return responseApi(res, { 'users': 1 }, { "saya": 1 }, "Users fetched successfully");
};

