module.exports = {
  getFromPath: (data, path) => {
    if (!path) return data

    return path.split('.').reduce(
      (curr, sub) => curr && curr[sub],
      data,
    )
  },
}
