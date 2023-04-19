describe("template spec", () => {
  it("returns a valid Unix timestamp for a valid date string.", () => {
    const inputDateString = "2016-01-01 02:03:22";
    const expectedTimestamp = 1451613802;

    cy.request({
      method: "GET",
      url: `/?cached&s=${inputDateString}`,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.equal(expectedTimestamp);
    });
  });

  it("returns a valid date string for a valid Unix timestamp.", () => {
    const inputTimestamp = 1451613802;
    const expectedDateString = "2016-01-01 02:03:22";

    cy.request({
      method: "GET",
      url: `/?cached&s=${inputTimestamp}`,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.equal(expectedDateString);
    });
  });

  it("returns false for an invalid date string", () => {
    const inputDateString = "foo";
    const expectedDateString = false;

    cy.request({
      method: "GET",
      url: `/?cached&s=${inputDateString}`,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.equal(expectedDateString);
    });
  });

  it("returns false for an empty date string", () => {
    const inputDateString = "";
    const expectedDateString = false;

    cy.request({
      method: "GET",
      url: `/?cached&s=${inputDateString}`,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.equal(expectedDateString);
    });
  });
});
