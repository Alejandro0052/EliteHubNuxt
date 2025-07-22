export default defineEventHandler(async (event) => {
	try {
		const dataStorage = useStorage("public");
		await dataStorage.setItem("test", "works2");
		let asd = await dataStorage.getItem("test");

		return asd;
	} catch (error) {
		throw createError({ statusCode: 500, message: "Error al obtener los datos" });
	}
});
