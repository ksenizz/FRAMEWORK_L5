const Framework = require("./application.js");
const Router = require("./router.js");

const server = new Framework();
const port = 5173;

server.listen(port, () => console.log(`Сервер запущен по порту ${port}`));

const userRouter = new Router();

userRouter.get("/users", (req, res) => {
  res.end(JSON.stringify({ id: 1, name: "Ксения", age: 19 }));
});

server.addRouter(userRouter);
