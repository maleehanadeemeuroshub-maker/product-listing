import authApi from "./auth";

export async function getAddresses() {
  const { data } = await authApi.get("/addresses");
  return data.addresses;
}

export async function addAddress(address) {
  const { data } = await authApi.post("/addresses", address);
  return data.addresses;
}

export async function deleteAddress(id) {
  const { data } = await authApi.delete(`/addresses/${id}`);
  return data.addresses;
}

export async function setDefaultAddress(id) {
  const { data } = await authApi.patch(`/addresses/${id}`);
  return data.addresses;
}
