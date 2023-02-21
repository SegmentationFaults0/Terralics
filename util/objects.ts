export function selectProps(...props: string[]) {
  return function (obj) {
    const newObj = {};
    props.forEach((name) => {
      newObj[name] = obj[name];
    });

    return newObj;
  };
}
