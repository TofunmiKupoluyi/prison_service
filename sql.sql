CREATE TABLE IF NOT EXISTS `mydb`.`qualification` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `prisoner_id` INT NULL,
  `education_level` INT NULL,
  `institution` VARCHAR(1000) NULL,
  `cv_link` VARCHAR(1000) NULL,
  `skill_type` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  INDEX `id_idx` (`prisoner_id` ASC),
  CONSTRAINT `id`
    FOREIGN KEY (`prisoner_id`)
    REFERENCES `mydb`.`prisoner_info` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
